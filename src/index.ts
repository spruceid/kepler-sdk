import { Signer } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import { KukaiEmbed } from 'kukai-embed';
import axios, { AxiosInstance } from 'axios';

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

    public async put<T>(orbit: string, content: T): Promise<string> {
        return await this.orbit(orbit).put(content)
    }

    public async del(orbit: string, cid: string): Promise<void> {
        return await this.orbit(orbit).del(cid)
    }

    public orbit(orbit: string): Orbit {
        return new Orbit(this.url, orbit, this.auth, this.http);
    }
}

export class Orbit {
    constructor(
        private url: string,
        private orbitId: string,
        private auth: Authenticator,
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

    public async put<T>(content: T): Promise<string> {
        let cid = "dummy_cid";
        return await this.http.put(makeOrbitPath(this.orbit), {
            headers: await this.headers(cid, Action.put),
            data: content
        }).then(res => res.data)
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

const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)
const createTzAuthMessage = (orbit: string, pkh: string, action: Action, cid: string): string =>
    `Tezos Signed Message: ${orbit}.kepler.net ${(new Date()).toISOString()} ${pkh} ${action} ${cid}`
const makeOrbitPath = (orbit: string): string => "/" + orbit
const makeContentPath = (orbit: string, cid: string): string => makeOrbitPath(orbit) + "/" + cid
