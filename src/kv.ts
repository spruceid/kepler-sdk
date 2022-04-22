import { Authenticator } from "./authenticator";
import { invoke } from "./kepler";

if (typeof fetch === "undefined") {
  const fetch = require("node-fetch");
}

export class KV {
  private orbitId: string;
  constructor(
    private url: string,
    private auth: Authenticator
  ) {
    this.orbitId = auth.getOrbitId();
  }

  public async get(key: string, version?: string): Promise<Response> {
    return await this.invoke({
      headers: await this.auth.invocationHeaders("get", key)
    });
  }

  public async head(key: string, version?: string): Promise<Response> {
    return await this.invoke({
      headers: await this.auth.invocationHeaders("metadata", key)
    });
  }

  public async put(
    key: string,
    value: Blob,
    metadata: { [key: string]: string }
  ): Promise<Response> {
    return await this.invoke({
      body: value,
      headers: { ...metadata, ...await this.auth.invocationHeaders("put", key) }
    });
  }

  public async del(key: string, version?: string): Promise<Response> {
    return await this.invoke({
      headers: await this.auth.invocationHeaders("del", key)
    });
  }

  public async list(prefix: string): Promise<Response> {
    return await this.invoke({
      headers: await this.auth.invocationHeaders("list", prefix)
    });
  }

  invoke = (params: { headers: HeadersInit; body?: Blob }): Promise<Response> =>
    invoke(this.url, params);
}
