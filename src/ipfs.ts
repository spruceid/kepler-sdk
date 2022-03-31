import { Authenticator } from "./authenticator";
import { makeCidString } from "./util";

export class Ipfs {
    constructor(
        private url: string,
        private orbitId: string,
        private auth: Authenticator,
    ) { }

    public get orbit(): string {
        return this.orbitId
    }

    public async get(cid: string, authenticate: boolean = true): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, cid), {
            method: "GET",
            headers: authenticate ? { ...await this.auth.content(this.orbit, 'ipfs', cid, 'get') } : undefined
        })
    }

    public async put(first: Blob, ...rest: Blob[]): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        const auth = await this.auth.content(this.orbit, 'ipfs', '', 'put')
        if (rest.length >= 1) {
            return await fetch(makeOrbitPath(this.url, oidCid), {
                method: "PUT",
                // @ts-ignore
                body: await makeFormRequest(first, ...rest),
                headers: auth
            })
        } else {
            return await fetch(makeOrbitPath(this.url, oidCid), {
                method: "PUT",
                body: first,
                headers: { ...auth, ...{ "Content-Type": "application/json" } }
            })
        }
    }

    public async del(cid: string): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeContentPath(this.url, oidCid, cid), {
            method: 'DELETE',
            headers: await this.auth.content(this.orbit, 'ipfs', cid, 'del')
        })
    }

    public async list(): Promise<Response> {
        const oidCid = await makeCidString(this.orbitId);
        return await fetch(makeOrbitPath(this.url, oidCid), {
            method: 'GET',
            headers: await this.auth.content(this.orbit, 'ipfs', '', 'list')
        })
    }
}

const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit

const makeContentPath = (url: string, orbit: string, cid: string): string => makeOrbitPath(url, orbit) + "/" + cid
