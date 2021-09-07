import fetch, { Response } from 'cross-fetch';
import CID from 'cids';
import multihashing from 'multihashing-async';
export { zcapAuthenticator } from './zcap';
export { tzStringAuthenticator } from './tzString';

export enum Action {
    get = 'GET',
    put = 'PUT',
    delete = 'DEL',
    list = 'LIST'
}

export interface Authenticator {
    content: (orbit: string, cids: string[], action: Action) => Promise<HeadersInit>;
    createOrbit: (cids: string[]) => Promise<HeadersInit>;
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

        return await this.get(orbit, cid, authenticate)
    }

    public async get(orbit: string, cid: string, authenticate: boolean = true): Promise<Response> {
        return await this.orbit(orbit).get(cid, authenticate)
    }

    // typed so that it takes at least 1 element
    public async put(orbit: string, first: any, ...rest: any[]): Promise<Response> {
        return await this.orbit(orbit).put(first, ...rest)
    }

    public async del(orbit: string, cid: string): Promise<Response> {
        return await this.orbit(orbit).del(cid)
    }

    public async list(orbit: string): Promise<Response> {
        return await this.orbit(orbit).list()
    }

    public orbit(orbit: string): Orbit {
        return new Orbit(this.url, orbit, this.auth);
    }

    public async createOrbit(first: any, ...rest: any[]): Promise<Response> {
        const auth = await this.auth.createOrbit(await Promise.all([first, ...rest].map(async (c) => await makeCid(c))))
        if (rest.length >= 1) {
            return await fetch(this.url, {
                method: 'POST',
                body: await makeFormRequest(first, ...rest),
                headers: auth
            });
        } else {
            return await fetch(this.url, {
                method: 'POST',
                body: JSON.stringify(first),
                headers: { ...auth, ...{ 'Content-Type': 'application/json' } }
            })
        }
    }
}

export class Orbit {
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

const addContent = async <T>(form: FormData, content: T) => {
    form.append(
        await makeCid(content),
        new Blob([JSON.stringify(content)], { type: 'application/json' })
    );
}

const makeCid = async <T>(content: T, codec: string = 'json'): Promise<string> => new CID(1, codec, await multihashing(new TextEncoder().encode(typeof content === 'string' ? content : JSON.stringify(content)), 'blake2b-256')).toString('base58btc')

export const getOrbitId = async (type_: string, params: { [k: string]: string | number }): Promise<string> => {
    return await makeCid(`${type_}${orbitParams(params)}`, 'raw');
}

export const orbitParams = (params: { [k: string]: string | number }): string => {
    let p = [];
    for (const [key, value] of Object.entries(params)) {
        p.push(`${key}=${typeof value === 'string' ? value : value.toString()}`);
    }
    p.sort();
    return ';' + p.join(';');
}

const makeOrbitPath = (url: string, orbit: string): string => url + "/" + orbit

const makeContentPath = (url: string, orbit: string, cid: string): string => makeOrbitPath(url, orbit) + "/" + cid

const makeFormRequest = async (first: any, ...rest: any[]): Promise<FormData> => {
    const data = new FormData();
    await addContent(data, first)
    for (const content of rest) { await addContent(data, content) }
    return data
}
