import { Authenticator, S3 } from ".";

export class Orbit {
    private s3: S3;

    constructor(keplerUrl: string, oid: string, authn: Authenticator) {
        this.s3 = new S3(keplerUrl, oid, authn);
    }

    async put(key: string, value: Blob): Promise<Response> {
        return this.s3.put(key, value, {})
    }

    async get(key: string): Promise<Response> {
        return this.s3.get(key)
    }

    async delete(key: string): Promise<Response> {
        return this.s3.del(key)
    }

    async list(): Promise<Response> {
        return this.s3.list()
    }

    async head(key: string): Promise<Response> {
        return this.s3.head(key)
    }
}