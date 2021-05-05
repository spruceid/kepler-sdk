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
    (orbit: string, cid: string, action: Action): Promise<string>;
}

export interface AuthFactory<B> {
    <S extends B>(signer: S): Promise<Authenticator>;
}

export const authenticator: AuthFactory<DAppClient> = async (client) =>
    async (orbit: string, cid: string, action: Action): Promise<string> => {
        const { publicKey: pk, address: pkh } = await client.getActiveAccount().then(acc => {
            if (acc === undefined) {
                throw new Error("No Active Account")
            }
            return acc
        });
        const auth = createTzAuthMessage(orbit, pk, pkh, action, cid);
        const { signature } = await client.requestSignPayload({
            signingType: SigningType.MICHELINE,
            payload: stringEncoder(auth)
        });
        return auth + " " + signature
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
    public async put<T>(orbit: string, first: T, ...rest: T[]): Promise<Response> {
        return await this.orbit(orbit).put(first, ...rest)
    }

    public async del(orbit: string, cid: string): Promise<Response> {
        return await this.orbit(orbit).del(cid)
    }

    public orbit(orbit: string): Orbit<A> {
        return new Orbit(this.url, orbit, this.auth);
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
            headers: authenticate ? { "Authorization": await this.auth(this.orbit, cid, Action.get) } : undefined
        })
    }

    public async put<T>(first: T, ...rest: T[]): Promise<Response> {
        if (rest.length >= 1) {
            const data = new FormData();
            await addContent(data, first)
            for (const content of rest) { await addContent(data, content) }
            return await fetch(makeOrbitPath(this.url, this.orbit), {
                method: "POST",
                // @ts-ignore
                body: data,
                headers: { "Authorization": await this.auth(this.orbit, await makeJsonCid(first), Action.put) }
            })
        } else {
            return await fetch(makeOrbitPath(this.url, this.orbit), {
                method: "POST",
                body: JSON.stringify(first),
                headers: {
                    "Authorization": await this.auth(this.orbit, await makeJsonCid(first), Action.put),
                    "Content-Type": "application/json"
                }
            })
        }
    }

    public async del(cid: string): Promise<Response> {
        return await fetch(makeContentPath(this.url, this.orbit, cid), {
            method: 'DELETE',
            headers: { 'Authorization': await this.auth(this.orbit, cid, Action.delete) }
        })
    }
}

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}

const addContent = async <T>(form: FormData, content: T) => {
    form.append(
        await makeJsonCid(content),
        new Blob([JSON.stringify(content)], { type: 'application/json' })
    );
}

const makeJsonCid = async <T>(content: T): Promise<string> => new CID(1, 'json', await multihashing(new TextEncoder().encode(JSON.stringify(content)), 'sha3-256')).toString('base64')
const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)
const createTzAuthMessage = (orbit: string, pk: string, pkh: string, action: Action, cid: string): string =>
    `Tezos Signed Message: ${orbit}.kepler.net ${(new Date()).toISOString()} ${pk} ${pkh} ${action} ${cid}`
const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit
const makeContentPath = (url: string, orbit: string, cid: string): string => makeOrbitPath(url, orbit) + "/" + cid
