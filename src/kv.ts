import { Authenticator } from "./authenticator";
import { invoke } from "./kepler";
import { makeCid, makeCidString } from "./util";

if (typeof fetch === "undefined") {
  const fetch = require("node-fetch");
}

export class KV {
  constructor(
    private url: string,
    private orbitId: string,
    private auth: Authenticator
  ) {}

  public get orbit(): string {
    return this.orbitId;
  }

  public async get(key: string, version?: string): Promise<Response> {
    const oidCid = await makeCidString(this.orbitId);
    return await this.invoke({
      headers: await this.auth.content(this.orbit, "s3", key, "get"),
    });
  }

  public async head(key: string, version?: string): Promise<Response> {
    const oidCid = await makeCidString(this.orbitId);
    return await this.invoke({
      headers: await this.auth.content(this.orbit, "s3", key, "metadata"),
    });
  }

  public async put(
    key: string,
    value: Blob,
    metadata: { [key: string]: string }
  ): Promise<Response> {
    const oidCid = await makeCidString(this.orbitId);
    const cid = await makeCid(new Uint8Array(await value.arrayBuffer()));
    const auth = await this.auth.content(this.orbit, "s3", key, "put");
    return await this.invoke({
      body: value,
      headers: { ...auth, ...metadata },
    });
  }

  public async del(key: string, version?: string): Promise<Response> {
    const oidCid = await makeCidString(this.orbitId);
    return await this.invoke({
      headers: await this.auth.content(this.orbit, "s3", key, "del"),
    });
  }

  public async list(prefix: string = ""): Promise<Response> {
    const oidCid = await makeCidString(this.orbitId);
    return await this.invoke({
      headers: await this.auth.content(this.orbit, "s3", prefix, "list"),
    });
  }

  invoke = (params: { headers: HeadersInit; body?: Blob }): Promise<Response> =>
    invoke(this.url, params);
}
