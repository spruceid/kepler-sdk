import { DAppClient } from '@airgap/beacon-sdk';
export { ethAuthenticator } from './zcap';
export declare enum Action {
    get = "GET",
    put = "PUT",
    delete = "DEL",
    list = "LIST"
}
export interface Authenticator {
    content: (orbit: string, cids: string[], action: Action) => Promise<string>;
    createOrbit: (cids: string[]) => Promise<string>;
}
export interface AuthFactory<B> {
    <S extends B>(signer: S, domain: string): Promise<Authenticator>;
}
export declare const tezosAuthenticator: AuthFactory<DAppClient>;
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
export declare const stringEncoder: (s: string) => string;
export declare const getOrbitId: (type_: string, pkh: string, params?: {
    domain?: string;
    salt?: string;
    index?: number;
}) => Promise<string>;
export declare const orbitParams: (params: {
    [k: string]: string | number;
}) => string;
