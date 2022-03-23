import fetch, { Response } from 'cross-fetch';
import CID from 'cids';
import multihashing from 'multihashing-async';
import { Ipfs } from './ipfs';
import { S3 } from './s3';
export { makeKRI, getKRI, makeOrbitId } from './util';
export { zcapAuthenticator, startSession } from './zcap';
export { tzStringAuthenticator } from './tzString';
export { siweAuthenticator, startSIWESession } from './siwe';
export { Ipfs };
export { S3 };

export enum Action {
    get = 'GET',
    put = 'PUT',
    delete = 'DEL',
    list = 'LIST'
}

export interface Authenticator {
    content: (orbit: string, service: string, path: string, fragment: string) => Promise<HeadersInit>;
    authorizePeer: (orbit: string, peer: string) => Promise<HeadersInit>;
};

export class Kepler {
    constructor(
        private url: string,
        private auth: Authenticator,
    ) { }

    public async resolve(keplerUri: string, authenticate: boolean = true): Promise<Response> {
        if (!keplerUri.startsWith("kepler:")) throw new Error("Invalid Kepler URI");

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

    public async newPeer(): Promise<string> {
        return await fetch(this.url + "/peer/generate").then(async res => await res.text());
    }

    public async idAddr(id: string): Promise<string> {
        return await fetch(this.url + "/peer/relay").then(async res => await res.text() + "/p2p-circuit/p2p/" + id);
    }

    public async createOrbit(orbit: string, peer: string): Promise<Response> {
        const oidCid = await makeCidString(orbit);
        const headers = await this.auth.authorizePeer(orbit, peer);
            return await fetch(this.url + "/" + oidCid, {
                method: 'POST',
                headers,
                body: orbit
            })
    }
}

const addContent = async (form: FormData, blob: Blob) => {
    form.append(
        await makeCid(new Uint8Array(await blob.arrayBuffer())),
        blob
    );
}

export const makeCid = async (content: Uint8Array): Promise<string> => new CID(1, 'raw', await multihashing(content, 'blake2b-256')).toString('base58btc')
export const makeCidString = async (content: string): Promise<string> => await makeCid(new TextEncoder().encode(content))

const makeFormRequest = async (first: Blob, ...rest: Blob[]): Promise<FormData> => {
    const data = new FormData();
    await addContent(data, first)
    for (const content of rest) { await addContent(data, content) }
    return data
}
