import { Kepler, Action, Authenticator, zcapAuthenticator, getOrbitId, orbitParams, sessionProps } from './';
import { keplerContext } from './zcap';
import { tz, didkey, randomId, Capabilities } from '@spruceid/zcap-providers';
import * as didkit from '@spruceid/didkit-wasm-node';
import fetch from 'cross-fetch';

import { DAppClient } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';
import { b58cencode, prefix } from "@taquito/utils";
import { randomBytes } from 'crypto';

const allowlist = 'http://localhost:10000';
const kepler = 'http://localhost:8000';

const startSession = async <C extends Capabilities, S extends Capabilities>(
    orbit: string,
    c: C,
    s: S,
    rights: string[] = ['list', 'get'],
    timeMs: number = 1000 * 60,
): Promise<Authenticator> => {
    // delegate to session key
    let exp = new Date(Date.now() + timeMs);
    const delegation = await c.delegate(
        sessionProps("kepler://" + orbit, s.id(), rights, exp),
        [],
        randomId(),
        keplerContext
    )
    console.log(delegation)

    // return authenticator for client
    return await zcapAuthenticator(s, delegation);
}

describe('Kepler Client', () => {
    let controller: Capabilities;
    let sessionKey: Capabilities;
    let oid: string;

    beforeAll(async () => {
        // create orbit controller
        controller = await tz(genTzClient(), didkit);
        const params = controller.id() + ';index=0;';
        // register orbit with allowlist
        oid = await fetch(`${allowlist}/${params}`, {
            method: 'PUT',
            body: JSON.stringify([controller.id()]),
            headers: {
                'Content-Type': 'application/json',
                'X-Hcaptcha-Sitekey': '10000000-ffff-ffff-ffff-000000000001',
                'X-Hcaptcha-Token': '10000000-aaaa-bbbb-cccc-000000000001'
            }
        }).then(async res => res.text());

        // create orbit
        await fetch(`${kepler}/al/${oid}`, {
            method: 'POST',
            body: params
        });

        // create session key
        sessionKey = await didkey(genJWK(), didkit);
    })

    it('naive integration test', async () => {
        // get authenticator for client
        const authn = await startSession(oid, controller, sessionKey, ['get', 'list', 'put', 'del']);
        const keplerClient = new Kepler(kepler, authn);

        const json = { hello: 'hey' };
        const uri = await keplerClient.orbit(oid).put(json).then(async res => res.text());
        console.log(uri);

        await expect(keplerClient.resolve(uri).then(async (res) => await res.json())).resolves.toEqual(json)
    })

    it('naive integration multipart test', async () => {
        // const kepler = new Kepler('https://faad7ca90d6c.ngrok.io', authn);
        // const orbit = kepler.orbit('uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA');
        // const fakeCid = "not_a_cid";

        // const json1 = { hello: 'hey' };
        // const json2 = { hello: 'hey again' };

        // await expect(orbit.get(fakeCid).then(res => res.status)).resolves.toEqual(200);

        // const cids = await orbit.put(json1, json2);
        // console.log(cids)

        // // await expect(orbit.get(cid)).resolves.toEqual(json)
        // // return await expect(orbit.del(cid)).resolves.not.toThrow()
    })
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

export const genJWK = (): JsonWebKey => JSON.parse(didkit.generateEd25519Key())
