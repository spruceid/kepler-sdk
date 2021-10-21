import fetch, { Response } from 'cross-fetch';
import CID from 'cids';
import multihashing from 'multihashing-async';
import { Ipfs } from './ipfs';
import { S3 } from './s3';
export { zcapAuthenticator, startSession, didVmToParams } from './zcap';
export { tzStringAuthenticator } from './tzString';
export { Ipfs };
export { S3 };

export enum Action {
    get = 'GET',
    put = 'PUT',
    delete = 'DEL',
    list = 'LIST'
}

export interface Authenticator {
    content: (orbit: string, cids: string[], action: Action) => Promise<HeadersInit>;
    createOrbit: (cids: string[], params: { [key: string]: number | string }, method: string) => Promise<HeadersInit>;
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

        return await this.orbit(orbit).get(cid, authenticate)
    }

    public s3(orbit: string): S3 {
        return new S3(this.url, orbit, this.auth);
    }

    public orbit(orbit: string): Ipfs {
        return new Ipfs(this.url, orbit, this.auth);
    }

    public async new_id(): Promise<string> {
        return await fetch(this.url + "/new_id").then(async res => await res.text());
    }

    public async id_addr(id: string): Promise<string> {
        return await fetch(this.url + "/relay").then(async res => await res.text() + "/p2p-circuit/p2p/" + id);
    }

    public async createOrbit(content: any[], params: { [key: string]: string | number } = {}, method: string = 'did'): Promise<Response> {
        const auth = await this.auth.createOrbit(await Promise.all(content.map(async (c) => await makeCid(c))), params, method)
        if (content.length === 1) {
            return await fetch(this.url, {
                method: 'POST',
                body: JSON.stringify(content[0]),
                headers: { ...auth, ...{ 'Content-Type': 'application/json' } }
            })
        } else if (content.length === 0) {
            return await fetch(this.url, {
                method: 'POST',
                headers: auth
            })
        } else {
            const [c, ...r] = content;
            return await fetch(this.url, {
                method: 'POST',
                body: await makeFormRequest(c, ...r),
                headers: auth
            });
        }
    }
}

const addContent = async <T>(form: FormData, content: T) => {
    form.append(
        await makeCid(content),
        new Blob([JSON.stringify(content)], { type: 'application/json' })
    );
}

export const makeCid = async <T>(content: T, codec: string = 'json'): Promise<string> => new CID(1, codec, await multihashing(new TextEncoder().encode(typeof content === 'string' ? content : JSON.stringify(content)), 'blake2b-256')).toString('base58btc')

export const getOrbitId = async (type_: string, params: { [k: string]: string | number }): Promise<string> => {
    return await makeCid(`${type_}${orbitParams(params)}`, 'raw');
}

export const orbitParams = (params: { [k: string]: string | number }): string => {
    let p = [];
    for (const [key, value] of Object.entries(params)) {
        p.push(`${encodeURIComponent(key)}=${encodeURIComponent(value === 'string' ? value : value.toString())}`);
    }
    p.sort();
    return ';' + p.join(';');
}

const makeFormRequest = async (first: any, ...rest: any[]): Promise<FormData> => {
    const data = new FormData();
    await addContent(data, first)
    for (const content of rest) { await addContent(data, content) }
    return data
}
