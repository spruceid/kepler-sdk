import { DAppClient, SigningType } from '@airgap/beacon-sdk';
import fetch, { Response } from 'cross-fetch';
import CID from 'cids';
import multihashing from 'multihashing-async';

export enum Action {
    get = "GET",
    put = "PUT",
    delete = "DEL"
}

export interface Authenticator {
    content: (orbit: string, cids: string[], action: Action) => Promise<string>;
    createOrbit: (cids: string[]) => Promise<string>;
}

export interface AuthFactory<B> {
    <S extends B>(signer: S, domain: string): Promise<Authenticator>;
}

export const authenticator: AuthFactory<DAppClient> = async (client, domain: string) => {
    const { publicKey: pk, address: pkh } = await client.getActiveAccount().then(acc => {
        if (acc === undefined) {
            throw new Error("No Active Account")
        }
        return acc
    });

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<string> => {
            const auth = createTzAuthContentMessage(orbit, pk, pkh, action, cids);
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(auth)
            });
            return auth + " " + signature
        },
        createOrbit: async (cids: string[]): Promise<string> => {
            const auth = await createTzAuthCreationMessage(pk, pkh, cids, domain)
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(auth)
            });
            return auth + " " + signature
        }
    }
}

export class Kepler {
    constructor(
        private url: string,
        private auth: Authenticator,
    ) { }

    public async resolve(keplerUri: string, authenticate: boolean = true): Promise<Response> {
        if (!keplerUri.startsWith("kepler://")) throw new Error("Invalid Kepler URI");

        let [versionedOrbit, cid] = keplerUri.split("/").slice(-2);
        let orbit = versionedOrbit.split(":").pop();

        if (!orbit || !cid) throw new Error("Invalid Kepler URI");

        return await this.get(orbit, cid, authenticate)
    }

    public async get(orbit: string, cid: string, authenticate: boolean = true): Promise<Response> {
        return await this.orbit(orbit).get(cid, authenticate)
    }

    // typed so that it takes at least 1 element
    public async put(orbit: string, first: any, ...rest: any[]): Promise<Response> {
        return await this.orbit(orbit).put(first, ...rest)
    }

    public async del(orbit: string, cid: string): Promise<Response> {
        return await this.orbit(orbit).del(cid)
    }

    public orbit(orbit: string): Orbit<A> {
        return new Orbit(this.url, orbit, this.auth);
    }

    public async createOrbit(first: any, ...rest: any[]): Promise<Response> {
        const auth = await this.auth.createOrbit(await Promise.all([first, ...rest].map(async (c) => await makeCid(c))))
        if (rest.length >= 1) {
            return await fetch(this.url, {
                method: 'POST',
                body: await makeFormRequest(first, ...rest),
                headers: { 'Authorization': auth}
            });
        } else {
            return await fetch(this.url, {
                method: 'POST',
                body: JSON.stringify(first),
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                }
            })
        }
    }
}

export class Orbit<A extends Authenticator> {
    constructor(
        private url: string,
        private orbitId: string,
        private auth: A,
    ) { }

    public get orbit(): string {
        return this.orbitId
    }

    public async get(cid: string, authenticate: boolean = true): Promise<Response> {
        return await fetch(makeContentPath(this.url, this.orbit, cid), {
            method: "GET",
            headers: authenticate ? { "Authorization": await this.auth.content(this.orbit, [cid], Action.get) } : undefined
        })
    }

    public async put(first: any, ...rest: any[]): Promise<Response> {
        const auth = await this.auth.content(this.orbit, await Promise.all([first, ...rest].map(async (c) => await makeCid(c))), Action.put)
        if (rest.length >= 1) {
            return await fetch(makeOrbitPath(this.url, this.orbit), {
                method: "POST",
                // @ts-ignore
                body: await makeFormRequest(first, ...rest),
                headers: { "Authorization": auth }
            })
        } else {
            return await fetch(makeOrbitPath(this.url, this.orbit), {
                method: "POST",
                body: JSON.stringify(first),
                headers: {
                    "Authorization": auth,
                    "Content-Type": "application/json"
                }
            })
        }
    }

    public async del(cid: string): Promise<Response> {
        return await fetch(makeContentPath(this.url, this.orbit, cid), {
            method: 'DELETE',
            headers: { 'Authorization': await this.auth.content(this.orbit, [cid], Action.delete) }
        })
    }
}

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}

const addContent = async <T>(form: FormData, content: T) => {
    form.append(
        await makeCid(content),
        new Blob([JSON.stringify(content)], { type: 'application/json' })
    );
}

const makeCid = async <T>(content: T, codec: string = 'json'): Promise<string> => new CID(1, codec, await multihashing(new TextEncoder().encode(JSON.stringify(content)), 'blake2b-256')).toString('base58btc')

const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)

export const getOrbitId = async (pkh: string, domain: string, nonce: number = 0): Promise<string> =>
    await makeCid(`${nonce}:${domain}:${pkh}`, 'raw')

const createTzAuthContentMessage = (orbit: string, pk: string, pkh: string, action: Action, cids: string[]): string =>
    `Tezos Signed Message: kepler.net ${(new Date()).toISOString()} ${pk} ${pkh} ${orbit} ${action} ${cids.join(' ')}`

const createTzAuthCreationMessage = async (pk: string, pkh: string, cids: string[], domain: string, nonce: number = 0): Promise<string> =>
    `Tezos Signed Message: kepler.net ${(new Date()).toISOString()} ${pk} ${pkh} ${await getOrbitId(pkh, domain, nonce)} CREATE ${nonce}:${domain} ${cids.join(' ')}`

const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit

const makeContentPath = (url: string, orbit: string, cid: string): string => makeOrbitPath(url, orbit) + "/" + cid

const makeFormRequest = async (first: any, ...rest: any[]): Promise<FormData> => {
    const data = new FormData();
    await addContent(data, first)
    for (const content of rest) { await addContent(data, content) }
    return data
}
