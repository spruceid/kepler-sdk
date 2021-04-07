import { Signer } from '@taquito/taquito';
import { HttpBackend } from '@taquito/http-utils';

export enum Action {
    get = "GET",
    put = "PUT",
    delete = "DEL"
}

export interface Authenticator {
    authenticate: (orbit: string, cid: string, action: Action) => Promise<string>;
}

export class TezosAuthenticator<S extends Signer> implements Authenticator {
    constructor( private signer: S ) {  }

    public async authenticate(orbit: string, cid: string, action: Action): Promise<string> {
        const auth = createTzAuthMessage(orbit, await this.signer.publicKey(), await this.signer.publicKeyHash(), action, cid);
        const { prefixSig } = await this.signer.sign(stringEncoder(auth));
        return auth + " " + prefixSig
    }
}

export class Kepler<A extends Authenticator> {
    constructor(
        private url: string,
        private auth: A,
        private http: HttpBackend = new HttpBackend()
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
        private http: HttpBackend = new HttpBackend()
    ) { }

    public get orbit(): string {
        return this.orbitId
    }

    public async get<T>(cid: string): Promise<T> {
        return await this.http.createRequest({
            url: makeContentPath(this.url, this.orbit, cid),
            method: 'GET',
            headers: {
                Authorization: await this.auth.authenticate(this.orbit, cid, Action.get)
            }
        })
    }

    public async put<T>(content: T): Promise<string> {
        return await this.http.createRequest({
            url: makeOrbitPath(this.url, this.orbit),
            // @ts-ignore, taquito http-utils doesnt officially support PUT yet but this still works
            method: 'PUT',
            headers: {
                Authorization: await this.auth.authenticate(this.orbit, "none", Action.put)
            }
        }, content)
    }

    public async del(cid: string): Promise<void> {
        return await this.http.createRequest({
            url: makeContentPath(this.url, this.orbit, cid),
            // @ts-ignore, taquito http-utils doesnt officially support DELETE yet but this still works
            method: 'DELETE',
            headers: {
                Authorization: await this.auth.authenticate(this.orbit, cid, Action.delete)
            }
        })
    }
}

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}

const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)
const createTzAuthMessage = (orbit: string, pk: string, pkh: string, action: Action, cid: string): string =>
    `Tezos Signed Message: ${orbit}.kepler.net ${Date.now()} ${pk} ${pkh} ${action} ${cid}`
const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit
const makeContentPath = (url: string, orbit: string, cid: string): string => makeOrbitPath(url, orbit) + "/" + cid
