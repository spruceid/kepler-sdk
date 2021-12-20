import { Authenticator } from "./index";
export declare class Ipfs {
    private url;
    private orbitId;
    private auth;
    constructor(url: string, orbitId: string, auth: Authenticator);
    get orbit(): string;
    get(cid: string, authenticate?: boolean): Promise<Response>;
    put(first: Blob, ...rest: Blob[]): Promise<Response>;
    del(cid: string): Promise<Response>;
    list(): Promise<Response>;
}
