import { Action, Authenticator, makeCid } from "./index";
import fetch from 'cross-fetch';

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
        return await fetch(makeContentPath(this.url, this.orbit, cid), {
            method: "GET",
            headers: authenticate ? { ...await this.auth.content(this.orbit, [cid], Action.get) } : undefined
        })
    }

    public async put(first: any, ...rest: any[]): Promise<Response> {
        const auth = await this.auth.content(this.orbit, await Promise.all([first, ...rest].map(async (c) => await makeCid(c))), Action.put)
        if (rest.length >= 1) {
            return await fetch(makeOrbitPath(this.url, this.orbit), {
                method: "PUT",
                // @ts-ignore
                body: await makeFormRequest(first, ...rest),
                headers: auth
            })
        } else {
            return await fetch(makeOrbitPath(this.url, this.orbit), {
                method: "PUT",
                body: JSON.stringify(first),
                headers: { ...auth, ...{ "Content-Type": "application/json" } }
            })
        }
    }

    public async del(cid: string): Promise<Response> {
        return await fetch(makeContentPath(this.url, this.orbit, cid), {
            method: 'DELETE',
            headers: await this.auth.content(this.orbit, [cid], Action.delete)
        })
    }

    public async list(): Promise<Response> {
        return await fetch(makeOrbitPath(this.url, this.orbit), { method: 'GET', headers: await this.auth.content(this.orbit, [], Action.list) })
    }
}

const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit

const makeContentPath = (url: string, orbit: string, cid: string): string => makeOrbitPath(url, orbit) + "/" + cid
