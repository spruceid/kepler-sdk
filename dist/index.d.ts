export { ethZcapAuthenticator } from './ethZcap';
export { tzStringAuthenticator } from './tzString';
export declare enum Action {
    get = "GET",
    put = "PUT",
    delete = "DEL",
    list = "LIST"
}
export interface Authenticator {
    content: (orbit: string, cids: string[], action: Action) => Promise<HeadersInit>;
    createOrbit: (cids: string[]) => Promise<HeadersInit>;
}
export declare class Kepler {
    private url;
    private auth;
    constructor(url: string, auth: Authenticator);
    resolve(keplerUri: string, authenticate?: boolean): Promise<Response>;
    get(orbit: string, cid: string, authenticate?: boolean): Promise<Response>;
    put(orbit: string, first: any, ...rest: any[]): Promise<Response>;
    del(orbit: string, cid: string): Promise<Response>;
    list(orbit: string): Promise<Response>;
    orbit(orbit: string): Orbit;
    createOrbit(first: any, ...rest: any[]): Promise<Response>;
}
export declare class Orbit {
    private url;
    private orbitId;
    private auth;
    constructor(url: string, orbitId: string, auth: Authenticator);
    get orbit(): string;
    get(cid: string, authenticate?: boolean): Promise<Response>;
    put(first: any, ...rest: any[]): Promise<Response>;
    del(cid: string): Promise<Response>;
    list(): Promise<Response>;
}
export declare const getOrbitId: (type_: string, params: {
    [k: string]: string | number;
}) => Promise<string>;
export declare const orbitParams: (params: {
    [k: string]: string | number;
}) => string;
