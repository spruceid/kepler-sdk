import { Signer } from '@taquito/taquito';
import { HttpBackend } from '@taquito/http-utils';

export enum Action {
    get = "GET",
    put = "PUT",
    delete = "DEL"
}

const createRequest = (orbit: string, action: Action, pk: string, pkh: string, cid: string): string => {
    return `Tezos Signed Message: ${orbit}.kepler.net ${Date.now()} ${pk} ${pkh} ${action} ${cid}`
}

const makePath = (url: string, orbit: string, cid: string) => url + "/" + orbit + "/" + cid

export class Kepler<S extends Signer> {
    constructor(
        private url: string,
        private signer: S,
        private http: HttpBackend = new HttpBackend()
    ) { }

    public async get<T>(orbit: string, cid: string): Promise<T> {
        return await this.http.createRequest({
            url: makePath(this.url, orbit, cid),
            method: 'GET',
            headers: {
                Authorization: await this.createAuth(orbit, cid, Action.get)
            }
        })
    }

    public async put<T>(content: T, orbit: string, cid: string): Promise<string> {
        return await this.http.createRequest<string>({
            url: makePath(this.url, orbit, cid),
            // @ts-ignore, taquito http-utils doesnt officially support PUT yet but this still works
            method: 'PUT',
            json: false,
            headers: {
                Authorization: await this.createAuth(orbit, cid, Action.put)
            }
        }, content)
    }

    public async del(orbit: string, cid: string): Promise<void> {
        return await this.http.createRequest({
            url: makePath(this.url, orbit, cid),
            // @ts-ignore, taquito http-utils doesnt officially support DELETE yet but this still works
            method: 'DELETE',
            headers: {
                Authorization: await this.createAuth(orbit, cid, Action.delete)
            }
        })

    }

    public orbit(orbit: string): Orbit<S> {
        return new Orbit(this, orbit);
    }

    private async createAuth(orbit: string, cid: string, action: Action): Promise<string> {
        const auth = createRequest(orbit, action, await this.signer.publicKey(), await this.signer.publicKeyHash(), cid);
        const { prefixSig } = await this.signer.sign(stringEncoder(auth));
        return auth + " " + prefixSig
    }
}

export class Orbit<S extends Signer> {
    constructor(
        private kepler: Kepler<S>,
        private orbitId: string
    ) { }

    public get orbit(): string {
        return this.orbitId
    }

    public async get<T>(cid: string): Promise<T> {
        return await this.kepler.get<T>(this.orbit, cid)
    }

    public async put<T>(content: T, cid: string): Promise<string> {
        return await this.kepler.put<T>(content, this.orbit, cid)
    }

    public async del(cid: string): Promise<void> {
        return await this.kepler.del(this.orbit, cid)
    }
}

const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string => {
    return n.toString(16).padStart(padLen, padChar)
}

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}
