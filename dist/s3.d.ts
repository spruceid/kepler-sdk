import { Authenticator } from "./index";
export declare class S3 {
    private url;
    private orbitId;
    private auth;
    constructor(url: string, orbitId: string, auth: Authenticator);
    get orbit(): string;
    get(key: string, authenticate?: boolean, version?: string): Promise<Response>;
    head(key: string, authenticate?: boolean, version?: string): Promise<Response>;
    put(key: string, value: Blob, metadata: {
        [key: string]: string;
    }): Promise<Response>;
    del(cid: string, version?: string): Promise<Response>;
    list(): Promise<Response>;
}
