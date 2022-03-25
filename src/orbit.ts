import { Authenticator, S3 } from ".";

type SessionOptions = {
    nbf?: Date,
    exp: Date,
};

export type ConnectionOptions = { orbit?: string, actions?: string[], sessionOpts?: SessionOptions };

export class OrbitConnection {
    private s3: S3;

    constructor(keplerUrl: string, private oid: string, authn: Authenticator) {
        this.s3 = new S3(keplerUrl, oid, authn);
    }

    id(): string {
        return this.oid;
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