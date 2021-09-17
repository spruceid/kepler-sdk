import { Kepler, startSession, didVmToParams } from './';
import { tz, didkey, Capabilities } from '@spruceid/zcap-providers';
import * as didkit from '@spruceid/didkit-wasm-node';
import fetch from 'cross-fetch';

import { DAppClient } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';
import { b58cencode, prefix } from "@taquito/utils";
import { randomBytes } from 'crypto';
import { sessionProps, zcapAuthenticator } from './zcap';

const allowlist = 'http://localhost:10000';
const kepler1 = 'http://localhost:8000';
const keplerAddr1 = '0.0.0.0'

const kepler2 = 'http://localhost:9000';
const keplerAddr2 = '0.0.0.0'

describe('Kepler Client', () => {
    let controller: Capabilities;
    let sessionKey: Capabilities;
    let oid: string;

    beforeAll(async () => {
        // create orbit controller
        controller = await tz(genTzClient(), didkit);

        // get host1 id
        const id1 = await fetch(`${kepler1}/key/`).then(res => res.text());
        const id2 = await fetch(`${kepler2}/key/`).then(res => res.text());
        console.log(id1, id2)

        const params = didVmToParams(controller.id(), {
            index: "0",
            hosts: `${id1}:${keplerAddr1}-${id2}:${keplerAddr2}`
        });

        // register orbit with allowlist
        oid = await fetch(`${allowlist}/${params}`, {
            method: 'PUT',
            body: JSON.stringify([controller.id()]),
            headers: {
                'Content-Type': 'application/json',
                'X-Hcaptcha-Sitekey': '10000000-ffff-ffff-ffff-000000000001',
                'X-Hcaptcha-Token': '10000000-aaaa-bbbb-cccc-000000000001'
            }
        }).then(res => res.text());

        // create orbits
        await fetch(`${kepler1}/al/${oid}`, {
            method: 'POST',
            body: params
        });

        // wait 1 second
        await new Promise((r) => setTimeout(r, 1000));

        await fetch(`${kepler2}/al/${oid}`, {
            method: 'POST',
            body: params
        });

        // wait 5 second
        await new Promise((r) => setTimeout(r, 5000));

        // create session key
        sessionKey = await didkey(genJWK(), didkit);
    }, 20000)

    it("replicates data", async () => {
        const json = {
            hello: 'hi'
        };
        // upload to kepler 1
        await fetch(`${kepler1}/s3/${oid}/my_json.json`, {
            method: 'PUT',
            body: JSON.stringify(json),
            headers: {
                'Content-Type': 'application/json',
                'x-kpr-meta-my-custom-header': 'a custom header'
            }
        })

        // wait 1 second
        await new Promise((r) => setTimeout(r, 1000));

        // download from kepler 2
        expect(fetch(`${kepler2}/s3/${oid}/my_json.json`).then(res => res.json())).resolves.toEqual(json);
        console.log(oid)
    })

    // it('only allows properly authorized actions', async () => {
    //     // get authenticator for client
    //     const write = new Kepler(kepler1, await startSession(oid, controller, sessionKey, ['put', 'del'])).orbit(oid);
    //     const read = new Kepler(kepler1, await startSession(oid, controller, sessionKey, ['get', 'list'])).orbit(oid);

    //     const json = { hello: 'hey' };
    //     const json2 = { hello: 'hey2' };

    //     // writer can write
    //     const uri = await write.put(json).then(async res => {
    //         expect(res.status).toEqual(200);
    //         return res.text()
    //     });
    //     const [cid] = uri.split("/").slice(-1);

    //     // reader can list
    //     await expect(read.list().then(async res => await res.json())).resolves.toHaveProperty('length', 1);
    //     // reader can read
    //     await expect(read.get(cid).then(async (res) => await res.json())).resolves.toEqual(json)
    //     // reader cant write
    //     await expect(read.put(json2)).resolves.toHaveProperty('status', 401);
    //     // reader cant delete
    //     await expect(read.del(cid)).resolves.toHaveProperty('status', 401);

    //     // writer cant list
    //     await expect(write.list()).resolves.toHaveProperty('status', 401);
    //     // writer cant read
    //     await expect(write.get(cid)).resolves.toHaveProperty('status', 401);
    //     // writer can delete
    //     await expect(write.del(cid)).resolves.toHaveProperty('status', 200);
    // })

    // it('doesnt allow expired authorizations', async () => {
    //     // get expired authenticator for client
    //     const keplerClient = new Kepler(kepler1, await startSession(oid, controller, sessionKey, ['list'], 0));
    //     await expect(keplerClient.list(oid)).resolves.toHaveProperty('status', 401);
    // })

    // it('only allows authorized invokers', async () => {
    //     const authd = new Kepler(kepler1, await startSession(oid, controller, sessionKey)).orbit(oid);
    //     const unauthd = [
    //         // incorrect invoker
    //         await zcapAuthenticator(
    //             await didkey(genJWK(), didkit),
    //             await controller.delegate(sessionProps(
    //                 "kepler://" + oid,
    //                 // id will not match randomly generated did:key
    //                 sessionKey.id(),
    //                 ['list'],
    //                 new Date(Date.now() + 1000 * 60)
    //             ), [])
    //         ),
    //         // no delegation
    //         await zcapAuthenticator(await didkey(genJWK(), didkit)),
    //         // expired delegation
    //         await startSession(oid, controller, sessionKey, ['list'], 0),
    //     ].map(a => new Kepler(kepler1, a).orbit(oid));

    //     await expect(authd.list()).resolves.toHaveProperty('status', 200);
    //     await Promise.all(unauthd.map(async k => await expect(k.list()).resolves.toHaveProperty('status', 401)))
    // })
})

const genTzClient = (secret: string = b58cencode(
    randomBytes(32),
    prefix.edsk2
)): DAppClient => {
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
