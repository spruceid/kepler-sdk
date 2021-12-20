import { Ipfs } from './ipfs';
import { S3 } from './s3';
export { zcapAuthenticator, startSession, didVmToParams } from './zcap';
export { tzStringAuthenticator } from './tzString';
export { siweAuthenticator, startSIWESession } from './siwe';
export { Ipfs };
export { S3 };
export declare enum Action {
    get = "GET",
    put = "PUT",
    delete = "DEL",
    list = "LIST"
}
export interface Authenticator {
    content: (orbit: string, cids: string[], action: Action) => Promise<HeadersInit>;
    createOrbit: (cids: string[], params: {
        [key: string]: number | string;
    }, method: string) => Promise<{
        headers: HeadersInit;
        oid: string;
    }>;
}
export declare class Kepler {
    private url;
    private auth;
    constructor(url: string, auth: Authenticator);
    resolve(keplerUri: string, authenticate?: boolean): Promise<Response>;
    s3(orbit: string): S3;
    orbit(orbit: string): Ipfs;
    new_id(): Promise<string>;
    id_addr(id: string): Promise<string>;
    createOrbit(content: Blob[], params?: {
        [key: string]: string | number;
    }, method?: string): Promise<Response>;
}
export declare const makeCid: (content: Uint8Array) => Promise<string>;
export declare const getOrbitId: (type_: string, params: string | {
    [k: string]: string | number;
}) => Promise<string>;
export declare const orbitParams: (params: {
    [k: string]: string | number;
}) => string;
