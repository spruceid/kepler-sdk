import { Action, Authenticator, makeCid, makeCidString } from "./index";
import fetch from 'cross-fetch';

export class S3 {
    constructor(
        private url: string,
        private orbitId: string,
        private auth: Authenticator,
    ) { }

    public get orbit(): string {
        return this.orbitId
    }

    public async get(key: string, authenticate: boolean = true, version?: string): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, key, version), {
            method: "GET",
            headers: authenticate ? { ...await this.auth.content(this.orbit, [key], Action.get) } : undefined
        })
    }

    public async head(key: string, authenticate: boolean = true, version?: string): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, key, version), {
            method: "HEAD",
            headers: authenticate ? { ...await this.auth.content(this.orbit, [key], Action.get) } : undefined
        })
    }

    public async put(key: string, value: Blob, metadata: { [key: string]: string }): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        const cid = await makeCid(new Uint8Array(await value.arrayBuffer()));
        const auth = await this.auth.content(this.orbit, [cid], Action.put)
        return await fetch(makeContentPath(this.url, oidCid, key), {
            method: "PUT",
            body: value,
            headers: { ...auth, ...metadata }
        })
    }

    public async del(cid: string, version?: string): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, cid, version), {
            method: 'DELETE',
            headers: await this.auth.content(this.orbit, [cid], Action.delete)
        })
    }

    public async list(): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeOrbitPath(this.url, oidCid), { method: 'GET', headers: await this.auth.content(this.orbit, [], Action.list) })
    }
}

const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit + "/s3"

const makeContentPath = (url: string, orbit: string, key: string, version?: string): string => makeOrbitPath(url, orbit) + "/" + key + (version ? `?version=${version}` : "")
