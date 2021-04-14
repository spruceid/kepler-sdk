import { Signer } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import { KukaiEmbed } from 'kukai-embed';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
// @ts-ignore
import Blob from 'blob';
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
    <S extends B>(signer: S): Authenticator;
}

export const taquitoAuthenticator: AuthFactory<Signer> = signer =>
    async (orbit: string, cid: string, action: Action): Promise<string> => {
        const auth = createTzAuthMessage(orbit, await signer.publicKeyHash(), action, cid);
        const { prefixSig } = await signer.sign(stringEncoder(auth));
        return auth + " " + prefixSig
    }

export const templeAuthenticator: AuthFactory<TempleWallet> = wallet =>
    async (orbit: string, cid: string, action: Action): Promise<string> => {
        const auth = createTzAuthMessage(orbit, await wallet.getPKH(), action, cid);
        return auth + " " + await wallet.sign(stringEncoder(auth));
    }

export const kukaiEmbedAuthenticator: AuthFactory<KukaiEmbed> = embed =>
    async (orbit: string, cid: string, action: Action): Promise<string> => {
        if (embed.user === null) {
            throw new Error("User Not Logged In")
        }
        const pkh = embed.user.pkh;
        const auth = createTzAuthMessage(orbit, pkh, action, cid);
        return auth + " " + await embed.signMessage(auth);
    }

export class Kepler<A extends Authenticator> {
    constructor(
        private url: string,
        private auth: A,
        private http: AxiosInstance = axios.create({ baseURL: url })
    ) { }

    public async get<T>(orbit: string, cid: string): Promise<T> {
        return await this.orbit(orbit).get(cid)
    }

    // typed so that it takes at least 1 element
    public async put<T>(orbit: string, first: T, ...rest: T[]): Promise<string> {
        return await this.orbit(orbit).put(first, ...rest)
    }

    public async del(orbit: string, cid: string): Promise<void> {
        return await this.orbit(orbit).del(cid)
    }

    public orbit(orbit: string): Orbit<A> {
        return new Orbit(this.url, orbit, this.auth, this.http);
    }
}

export class Orbit<A extends Authenticator> {
    constructor(
        private url: string,
        private orbitId: string,
        private auth: A,
        private http: AxiosInstance = axios.create({ baseURL: url }),
    ) { }

    public get orbit(): string {
        return this.orbitId
    }

    public async get<T>(cid: string): Promise<T> {
        return await this.http.get(makeContentPath(this.orbit, cid), {
            headers: await this.headers(cid, Action.get)
        }).then(res => res.data.data)
    }

    public async put<T>(first: T, ...rest: T[]): Promise<string> {
        if (rest.length >= 1) {
            const data = new FormData();
            await addContent(data, first)
            for (const content of rest) { await addContent(data, content) }
            return await this.http.post(makeOrbitPath(this.orbit), {
                headers: {
                    ...await this.headers(await makeJsonCid(first), Action.put),
                    // @ts-ignore, TODO ensure this behaves well in browser
                    ...(form.getHeaders ? form.getHeaders?.() : { 'Content-Type': 'multipart/form-data' })
                },
                data
            }).then(res => res.data)
        } else {
            return await this.http.post(makeOrbitPath(this.orbit), {
                headers: await this.headers(await makeJsonCid(first), Action.put),
                data: first
            }).then(res => res.data)    
        }
    }

    public async del(cid: string): Promise<void> {
        return await this.http.delete(makeContentPath(this.orbit, cid), {
            headers: await this.headers(cid, Action.put)
        }).then(_ => {  })
    }
 
    private async headers(cid: string, action: Action) {
        return {
            'Authorization': await this.auth(this.orbit, cid, action),
            ...this.http.defaults.headers
        }
    }
}

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}

const addContent = async <T>(form: FormData, content: T) => {
    form.append(
        await makeJsonCid(content),
        // @ts-ignore
        new Blob([ JSON.stringify(content) ], { type: 'application/json' })
    );
}

const makeJsonCid = async <T>(content: T): Promise<string> => new CID(1, 'json', await multihashing(new TextEncoder().encode(JSON.stringify(content)), 'sha3-256')).toString('base64')
const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)
const createTzAuthMessage = (orbit: string, pkh: string, action: Action, cid: string): string =>
    `Tezos Signed Message: ${orbit}.kepler.net ${(new Date()).toISOString()} ${pkh} ${action} ${cid}`
const makeOrbitPath = (orbit: string): string => "/" + orbit
const makeContentPath = (orbit: string, cid: string): string => makeOrbitPath(orbit) + "/" + cid
