import { Kepler, startSession, didVmToParams } from './';
import { tz, didkey, Capabilities } from '@spruceid/zcap-providers';
import * as didkit from '@spruceid/didkit-wasm-node';
import fetch from 'cross-fetch';

import { DAppClient } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';
import { b58cencode, prefix } from "@taquito/utils";
import { randomBytes } from 'crypto';
import { sessionProps, zcapAuthenticator } from './zcap';
import { S3 } from './s3';

const allowlist = 'http://localhost:10000';
const kepler = ['http://localhost:8000', 'http://localhost:9000'];

const hostsToString = (h: { [key: string]: string[] }) =>
    Object.keys(h).map(host => `${host}:${h[host].join(",")}`).join("|")

const create = async ([url, ...urls]: string[], [main, ...rest]: Capabilities[], params: { [key: string]: string | number } = { nonce: genSecret() }, method?: string): Promise<string> => {
    const hosts = await [url, ...urls].reduce<Promise<{ [k: string]: string[] }>>(async (h, url) => {
        const hs = await h;
        const k = new Kepler(url, await zcapAuthenticator(main));
        const id = await k.new_id();
        hs[id] = [await k.id_addr(id)];
        return hs
    }, Promise.resolve({}))

    // TODO deploy contract
    const manifest = {
        controllers: [main, ...rest].map(c => c.id()),
        hosts
    }

    params["hosts"] = hostsToString(hosts);

    await Promise.all(urls.map(async url => {
        const k = new Kepler(url, await zcapAuthenticator(main));
        console.log(await k.createOrbit([], params, method).then(async r => await r.text()))
    }));

    const k = new Kepler(url, await zcapAuthenticator(main));
    return await k.createOrbit([], params, method).then(async r => await r.text());
}

describe('Kepler Client', () => {

    beforeAll(async () => {
    })

    it('only allows properly authorized actions', async () => {
        // create orbit controller
        const controller = await tz(genTzClient(), didkit);

        const oid = await create(kepler, [controller]);

        // create session key
        const sessionKey = await didkey(genJWK(), didkit);

        // get authenticator for client
        const write = new Kepler(kepler[0], await startSession(oid, controller, sessionKey, ['put', 'del'])).orbit(oid);
        const read = new Kepler(kepler[0], await startSession(oid, controller, sessionKey, ['get', 'list'])).orbit(oid);

        const json = { hello: 'hey' };
        const json2 = { hello: 'hey2' };

        // writer can write
        const uri = await write.put(json).then(async res => {
            expect(res.status).toEqual(200);
            return res.text()
        });
        const [cid] = uri.split("/").slice(-1);

        // reader can list
        await expect(read.list().then(async res => await res.json())).resolves.toHaveProperty('length', 1);
        // reader can read
        await expect(read.get(cid).then(async (res) => await res.json())).resolves.toEqual(json)
        // reader cant write
        await expect(read.put(json2)).resolves.toHaveProperty('status', 401);
        // reader cant delete
        await expect(read.del(cid)).resolves.toHaveProperty('status', 401);

        // writer cant list
        await expect(write.list()).resolves.toHaveProperty('status', 401);
        // writer cant read
        await expect(write.get(cid)).resolves.toHaveProperty('status', 401);
        // writer can delete
        await expect(write.del(cid)).resolves.toHaveProperty('status', 200);
    })

    it('replicates in s3', async () => {
        // create orbit controller
        const controller = await tz(genTzClient(), didkit);

        const oid = await create(kepler, [controller]);

        const node1 = new S3(kepler[0], oid, await zcapAuthenticator(controller));
        const node2 = new S3(kepler[1], oid, await zcapAuthenticator(controller));

        await new Promise(res => setTimeout(res, 4000));
        const json = { hello: "there" };
        const res = await node1.put('key1', JSON.stringify(json), { "my-header": "my header value", "content-type": "application/json" });
        expect(res.status).toEqual(200);

        const getRes1 = await node1.get('key1');

        expect(getRes1.status).toEqual(200);
        await expect(getRes1.json()).resolves.toEqual(json);
        expect(getRes1.headers.get('my-header')).toEqual('my header value');

        await new Promise(res => setTimeout(res, 4000));

        const getRes2 = await node2.get('key1', false);
        expect(getRes2.status).toEqual(200);
        await expect(getRes2.json()).resolves.toEqual(json);
        expect(getRes1.headers.get('my-header')).toEqual('my header value');
    }, 60000)

    it('doesnt allow expired authorizations', async () => {
        // create orbit controller
        const controller = await tz(genTzClient(), didkit);

        const oid = await create(kepler, [controller]);

        // create session key
        const sessionKey = await didkey(genJWK(), didkit);

        // get expired authenticator for client
        const keplerClient = new Kepler(kepler[0], await startSession(oid, controller, sessionKey, ['list'], 0)).orbit(oid);
        await expect(keplerClient.list()).resolves.toHaveProperty('status', 401);
    })

    it('only allows authorized invokers', async () => {
        // create orbit controller
        const controller = await tz(genTzClient(), didkit);

        const oid = await create(kepler, [controller]);

        // create session key
        const sessionKey = await didkey(genJWK(), didkit);

        const authd = new Kepler(kepler[0], await startSession(oid, controller, sessionKey)).orbit(oid);
        const unauthd = [
            // incorrect invoker
            await zcapAuthenticator(
                await didkey(genJWK(), didkit),
                await controller.delegate(sessionProps(
                    "kepler://" + oid,
                    // id will not match randomly generated did:key
                    sessionKey.id(),
                    ['list'],
                    new Date(Date.now() + 1000 * 60)
                ), [])
            ),
            // no delegation
            await zcapAuthenticator(await didkey(genJWK(), didkit)),
            // expired delegation
            await startSession(oid, controller, sessionKey, ['list'], 0),
        ].map(a => new Kepler(kepler[0], a).orbit(oid));

        await expect(authd.list()).resolves.toHaveProperty('status', 200);
        await Promise.all(unauthd.map(async k => await expect(k.list()).resolves.toHaveProperty('status', 401)))
    })
})

const genSecret = () => b58cencode(
    randomBytes(32),
    prefix.edsk2
)

const genTzClient = (secret: string = genSecret()): DAppClient => {
    const ims = new InMemorySigner(secret);
    // @ts-ignore
    return {
        // @ts-ignore
        getActiveAccount: async () => ({ publicKey: await ims.publicKey(), address: await ims.publicKeyHash() }),
        // @ts-ignore
        requestSignPayload: async ({ payload }) => ({ signature: await ims.sign(payload).then(res => res.prefixSig) })
    }
}

const genJWK = (): JsonWebKey => JSON.parse(didkit.generateEd25519Key())
