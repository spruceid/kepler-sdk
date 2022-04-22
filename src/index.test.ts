import { Kepler, OrbitConnection, Response } from "./";
import Blob from "fetch-blob";
import { Wallet } from "ethers";
import { defaultAuthn } from "./authenticator";
import { hostOrbit } from "./orbit";

const keplerUrl = "http://localhost:8000";
const domain = "example.com";

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

describe("Authenticator", () => {
  it("invoke", async () => {
    let a = await defaultAuthn(newWallet(), {expirationTime: '3000-01-01T00:00:00.000Z', issuedAt: '2022-01-01T00:00:00.000Z', domain});
    await a.invocationHeaders("get", "path");
  })

  it("host", async () => {
    let wallet = newWallet();
    await defaultAuthn(wallet, {expirationTime: '3000-01-01T00:00:00.000Z', issuedAt: '2022-01-01T00:00:00.000Z', domain})
      .then(authn => new OrbitConnection(keplerUrl, authn))
      .then(orbitConnection => hostOrbit(wallet, keplerUrl, orbitConnection.id(), domain))
      .then(expectSuccess);
  })
})

describe("Kepler Client", () => {
  let orbit: OrbitConnection;
  const keplerConfig = { hosts: [keplerUrl] };
  const orbitConfig = { domain};

  beforeAll(async () => {
    orbit = await new Kepler(newWallet(), keplerConfig).orbit(orbitConfig);
  });

  it("cannot put null value", async () => {
    let key = "null";
    let value = null;
    try {
      await orbit.put(key, value);
    } catch {
      return;
    }
    fail("function should fail due to storing a null");
  });

  it("cannot put undefined value", async () => {
    let key = "undefined";
    let value = undefined;
    try {
      await orbit.put(key, value);
    } catch {
      return;
    }
    fail("function should fail due to storing a null");
  });

  it("cannot put unsupported type", async () => {
    let key = "date";
    let value = new Date();
    try {
      await orbit.put(key, value);
    } catch {
      return;
    }
    fail("function should fail due to storing an unsupported type");
  });

  it("can put & get plaintext", async () => {
    let key = "plaintext";
    let value = "value";
    await orbit
      .put(key, value)
      .then(expectSuccess)
      .then(() => orbit.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });

  it("can put & get json", async () => {
    let key = "json";
    let value = { some: "object", with: "properties" };
    await orbit
      .put(key, value)
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

  it("can stream objects and lists from Kepler", async () => {
    let key = "plaintext";
    let val = "test".repeat(1048576);
    await orbit
      .put(key, val)
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
    await orbit.list('', {streamBody: true})
      .then(expectSuccess)
      .then(async ({ data }) => {
        if (!data) {
          return Promise.reject("response did not contain the data");
        }
        let output = "";
        data.on("data", (chunk: string) => {
          output += chunk;
        });
        data.on("error", fail);
        data.on("end", () => {
          let list = JSON.parse(output);
          expect(list).toBeInstanceOf(Array);
          expect(typeof list[0] === 'string').toBeTruthy();
        });
      });
  });

  it("can list & delete", async () => {
    let key = "listAndDelete";
    let value = "value";
    // @ts-ignore
    await orbit
      .put(key, value)
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

  it("can list by prefix", async () => {
    let key = "aVeryUniquePrefix1";
    let value = "value";
    await orbit
      .put(key, value)
      .then(expectSuccess);

    key = "aVeryUniquePrefix2";
    value = "value";
    await orbit
      .put(key, value)
      .then(expectSuccess);

    key = "boring";
    value = "value";
    await orbit
      .put(key, value)
      .then(expectSuccess);
    
    let everything: string[] = await orbit.list()
      .then(expectSuccess)
      .then(({ data }) => data);
    
    let veryUnique: string[] = await orbit.list('aVeryUnique')
      .then(expectSuccess)
      .then(({ data }) => data);

    expect(veryUnique).toHaveLength(2);
    expect(veryUnique.length).toBeLessThan(everything.length);
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
      .orbit({ orbitId: orbit.id(), ...orbitConfig })
      .then((orbit) => orbit.list())
      .then(expectUnauthorised);
  });

  it("expired session key cannot be used", async () => {
    await new Kepler(newWallet(), keplerConfig)
      .orbit({
        expirationTime: new Date(Date.now() - 1000 * 60 * 60).toISOString() ,
       ...orbitConfig})
      .then((orbit) => orbit.list())
      .then(expectUnauthorised);
  });

  it("only allows properly authorised actions", async () => {
    const kepler = new Kepler(newWallet(), keplerConfig);
    const write = await kepler.orbit({ actions: ["put", "del"], ...orbitConfig });
    const read = await kepler.orbit({ actions: ["get", "list"], ...orbitConfig });

    const key = "key";
    const json = { hello: "hey" };
    const json2 = { hello: "hey2" };

    // writer can write
    // @ts-ignore
    await write
      .put(key, json)
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
      .put(key, json2)
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
    const orbit1 = await new Kepler(wallet, keplerConfig).orbit({ domain: "example1.com"});
    const orbit2 = await new Kepler(wallet, keplerConfig).orbit({ domain: "example2.com"});

    const key = "key";
    const value = "value";
    await orbit1
      .put(key, value)
      .then(expectSuccess)
      .then(() => orbit2.get(key))
      .then(expectSuccess)
      .then(({ data }) => expect(data).toEqual(value));
  });
});
