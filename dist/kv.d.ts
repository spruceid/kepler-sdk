import { Authenticator } from "./authenticator";
export declare class KV {
    private url;
    private auth;
    constructor(url: string, auth: Authenticator);
    get(key: string): Promise<Response>;
    head(key: string): Promise<Response>;
    put(key: string, value: Blob, metadata: {
        [key: string]: string;
    }): Promise<Response>;
    del(key: string): Promise<Response>;
    list(prefix: string): Promise<Response>;
    invoke: (params: {
        headers: HeadersInit;
        body?: Blob;
    }) => Promise<Response>;
}
