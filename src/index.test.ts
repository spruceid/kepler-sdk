import { Kepler, OrbitConnection, Response } from "./";
import Blob from "fetch-blob";
import fetch from "node-fetch";
import { Wallet } from "ethers";

function expectSuccess(response: Response): Response {
  expect(response.status).toBe(200);
  return response;
}

function expectUnauthorised(response: Response): Response {
  expect(response.status).toBe(401);
  return response;
}

function newWallet(): Wallet {
  const wallet: Wallet = Wallet.createRandom();
  wallet.getChainId = () => Promise.resolve(1);
  return wallet;
}

describe("Kepler Client", () => {
  let orbit: OrbitConnection;
  const keplerConfig = { hosts: ["http://localhost:8000"] };

  beforeAll(async () => {
    (global as any).window = { location: { hostname: "example.com" } };
    (global as any).fetch = fetch;

    orbit = await new Kepler(newWallet(), keplerConfig).orbit();
  });

  it("cannot put with unsupported mime-type", async () => {
    let key = "pdf";
    let value = new ArrayBuffer(8);
    try {
      await orbit.put(key, value, { type: "application/pdf" });
    } catch {
      return;
    }
    fail("function should fail due to unsupported mime-type");
  });

  it("cannot put non-blob without specifying mime-type", async () => {
    let key = "nonBlob";
    let value = "value";
    try {
      await orbit.put(key, value);
    } catch {
      return;
    }
    fail("function should fail due to unknown mime-type");
  });

  it("can put & get plaintext", async () => {
    let key = "plaintext";
    let value = "value";
    await orbit
      .put(key, value, { type: "text/plain" })
      .then(expectSuccess)
      .then(() => orbit.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });

  it("can put & get json", async () => {
    let key = "json";
    let value = { some: "object", with: "properties" };
    await orbit
      .put(key, value, { type: "application/json" })
      .then(expectSuccess)
      .then(() => orbit.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });

  it("can put & get text blob", async () => {
    let key = "blob";
    let value = "value";
    let blob = new Blob([value], { type: "text/plain" });
    await orbit
      .put(key, blob)
      .then(expectSuccess)
      .then(() => orbit.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });

  it("can put & get json blob", async () => {
    let key = "blob";
    let value = { some: "object", with: "properties" };
    let blob = new Blob([JSON.stringify(value)], { type: "application/json" });
    await orbit
      .put(key, blob)
      .then(expectSuccess)
      .then(() => orbit.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });

  it("can put & get any blob", async () => {
    let key = "blob";
    let blob = new Blob([new ArrayBuffer(8)], { type: "image/gif" });
    await orbit
      .put(key, blob)
      .then(expectSuccess)
      .then(() => orbit.get(key))
      .then(expectSuccess)
      .then(({ data }) => {
        expect(data.type).toEqual("image/gif");
        expect(data.arrayBuffer()).resolves.toEqual(new ArrayBuffer(8));
      });
  });

  it("can stream an object from Kepler", async () => {
    let key = "plaintext";
    let val = "test".repeat(1048576);
    await orbit
      .put(key, val, { type: "text/plain" })
      .then(expectSuccess)
      .then(() => orbit.get(key, { streamBody: true }))
      .then(expectSuccess)
      .then(async ({ data }) => {
        if (!data) {
          return Promise.reject("response did not contain the data");
        }
        // Please note that this test is running with Node, and therefore is using the Node
        // implementation of ReadableStream, which differs from the browser implementation.
        let output = "";
        data.on("data", (chunk: string) => {
          output += chunk;
        });
        data.on("end", () => expect(output).toEqual(val));
        data.on("error", fail);
      });
  });

  it("can list & delete", async () => {
    let key = "listAndDelete";
    let value = "value";
    // @ts-ignore
    await orbit
      .put(key, new Blob([value], { type: "text/plain" }))
      .then(expectSuccess)
      .then(() => orbit.list())
      .then(expectSuccess)
      .then(({ data }) => expect(data).toContain(key))
      .then(() => orbit.delete(key))
      .then(expectSuccess)
      .then(() => orbit.list())
      .then(expectSuccess)
      .then(({ data }) => expect(data).not.toContain(key));
  });

  it("can retrieve content-type", async () => {
    let key = "headContentType";
    // @ts-ignore
    await orbit
      .put(key, new Blob([new ArrayBuffer(8)], { type: "image/gif" }))
      .then(expectSuccess)
      .then(() => orbit.head(key))
      .then(expectSuccess)
      .then(({ headers }) => headers.get("content-type"))
      .then((cType) => expect(cType).toEqual("image/gif"));
  });

  it("undelegated account cannot access a different orbit", async () => {
    await new Kepler(newWallet(), keplerConfig)
      .orbit({ orbit: orbit.id() })
      .then((orbit) => orbit.list())
      .then(expectUnauthorised);
  });

  it("expired session key cannot be used", async () => {
    await new Kepler(newWallet(), keplerConfig)
      .orbit({
        sessionOpts: { expirationTime: new Date(Date.now() - 1000 * 60 * 60) },
      })
      .then((orbit) => orbit.list())
      .then(expectUnauthorised);
  });

  it("only allows properly authorised actions", async () => {
    const kepler = new Kepler(newWallet(), keplerConfig);
    const write = await kepler.orbit({ actions: ["put", "del"] });
    const read = await kepler.orbit({ actions: ["get", "list"] });

    const key = "key";
    const json = { hello: "hey" };
    const json2 = { hello: "hey2" };

    // writer can write
    // @ts-ignore
    await write
      .put(key, json, { type: "application/json" })
      .then(expectSuccess);

    // reader can list
    await read
      .list()
      .then(expectSuccess)
      .then(({ data }) => expect(data.length).toBe(1));
    // reader can read
    await read
      .get(key)
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(json));
    // reader cant write
    // @ts-ignore
    await read
      .put(key, json2, { type: "application/json" })
      .then(expectUnauthorised);
    // reader cant delete
    await read.delete(key).then(expectUnauthorised);

    // writer cant list
    await write.list().then(expectUnauthorised);
    // writer cant read
    await write.get(key).then(expectUnauthorised);
    // writer can delete
    await write.delete(key).then(expectSuccess);
  });

  it("there is a one-to-one mapping between wallets and orbits", async () => {
    const wallet = newWallet();
    (global as any).window = { location: { hostname: "example1.com" } };
    const orbit1 = await new Kepler(wallet, keplerConfig).orbit();
    (global as any).window = { location: { hostname: "example2.com" } };
    const orbit2 = await new Kepler(wallet, keplerConfig).orbit();

    const key = "key";
    const value = "value";
    await orbit1
      .put(key, value, { type: "text/plain" })
      .then(expectSuccess)
      .then(() => orbit2.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });
});
