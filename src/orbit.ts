import { Authenticator, S3 } from ".";
import Blob from 'fetch-blob';

export class OrbitConnection {
    private s3: S3;

    constructor(keplerUrl: string, private oid: string, authn: Authenticator) {
        this.s3 = new S3(keplerUrl, oid, authn);
    }

    id(): string {
        return this.oid;
    }

    async put(key: string, value: any, req?: Request): Promise<Response> {
        const request = req || {};
        const type = request.type || "unknown";

        const transformResponse = (response: FetchResponse) => {
            const { ok, status, statusText, headers } = response;
            return { ok, status, statusText, headers }
        };

        const blob: Blob = 
            type.startsWith('text/') ? new Blob([value], { type }) :
            type === "application/json" ? new Blob([JSON.stringify(value)], { type }) :
            value;

        // @ts-ignore
        return blob.constructor.name == 'Blob' ? this.s3.put(key, blob, {}).then(transformResponse) :
            request.type ? Promise.reject(`unsupported mime-type: ${type}`) :
            Promise.reject('value must be a `Blob` if `type` is omitted from the request');
    }

    async get(key: string, req?: Request): Promise<Response> {
        const request = req || {};
        const streamBody = request.streamBody || false;

        const transformResponse = async (response: FetchResponse) => {
            const { ok, status, statusText, headers } = response;
            const type: string | null = headers.get('content-type');
            const data = !ok ? undefined :
                streamBody ? response.body :
                await (
                    // content type was not stored, let the caller decide how to handle the blob
                    !type ? response.blob() :
                    type.startsWith('text/') ? response.text() :
                    type === 'application/json' ? response.json() :
                    response.blob()
                );
            return { ok, status, statusText, headers, data };
        };

        return this.s3.get(key).then(transformResponse)
    }

    async delete(key: string, req?: Request): Promise<Response> {
        const transformResponse = (response: FetchResponse) => {
            const { ok, status, statusText, headers } = response;
            return { ok, status, statusText, headers }
        };

        return this.s3.del(key).then(transformResponse)
    }

    async list(req?: Request): Promise<Response> {
        const request = req || {};
        const streamBody = request.streamBody || false;

        const transformResponse = async (response: FetchResponse) => {
            const { ok, status, statusText, headers } = response;
            const data = !ok ? undefined :
                streamBody ? response.body : await response.json();

            return { ok, status, statusText, headers, data };
        };

        return this.s3.list().then(transformResponse)
    }

    async head(key: string, req?: Request): Promise<Response> {
        const transformResponse = (response: FetchResponse) => {
            const { ok, status, statusText, headers } = response;
            return { ok, status, statusText, headers }
        };

        return this.s3.head(key).then(transformResponse)
    }
}

export type Request = { type?: string, streamBody?: boolean };
export type Response = { ok: boolean, status: number, statusText: string, headers: Headers, data?: any };

type FetchResponse = globalThis.Response;

export type SessionOptions = {
    nbf?: Date,
    exp: Date,
};

export type ConnectionOptions = { orbit?: string, actions?: string[], sessionOpts?: SessionOptions };
