import { Authenticator } from "./authenticator";
import { makeCid, makeCidString } from "./util";

if (typeof fetch === "undefined") {
    const fetch = require('node-fetch');
}

export class KV {
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
        return await fetch(makeContentPath(this.url, oidCid, key), {
            method: "GET",
            headers: authenticate ? { ...await this.auth.content(this.orbit, 's3', key, 'get') } : undefined
        })
    }

    public async head(key: string, authenticate: boolean = true, version?: string): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, key), {
            method: "HEAD",
            headers: authenticate ? { ...await this.auth.content(this.orbit, 's3', key, 'metadata') } : undefined
        })
    }

    public async put(key: string, value: Blob, metadata: { [key: string]: string }): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        const cid = await makeCid(new Uint8Array(await value.arrayBuffer()));
        const auth = await this.auth.content(this.orbit, 's3', key, 'put')
        return await fetch(makeContentPath(this.url, oidCid, key), {
            method: "PUT",
            body: value,
            headers: { ...auth, ...metadata }
        })
    }

    public async del(key: string, version?: string): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, key, version), {
            method: 'DELETE',
            headers: await this.auth.content(this.orbit, 's3', key, 'del')
        })
    }

    public async list(prefix: string = ''): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeOrbitPath(this.url, oidCid), {
            method: 'GET',
            headers: await this.auth.content(this.orbit, 's3', prefix, 'list')
        })
    }
}

const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit + "/s3"

const makeContentPath = (url: string, orbit: string, key: string, version?: string): string => makeOrbitPath(url, orbit) + "/" + key + (version ? `?version=${version}` : "")
