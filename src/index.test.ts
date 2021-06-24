import { Kepler, Action, Authenticator, authenticator, stringEncoder, getOrbitId, orbitParams } from './';
import { DAppClient } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';
import { b58cencode, prefix } from "@taquito/utils";
const crypto = require('crypto')

const ims = new InMemorySigner('edsk2gL9deG8idefWJJWNNtKXeszWR4FrEdNFM5622t1PkzH66oH3r');
const mockAccount = jest.fn(async () => ({ publicKey: await ims.publicKey(), address: await ims.publicKeyHash() }))
const mockSign = jest.fn(async ({ payload }) => ({ signature: await ims.sign(payload).then(res => res.prefixSig) }))

// @ts-ignore, mock DAppClient account info
DAppClient.prototype.getActiveAccount = mockAccount;

// @ts-ignore, mock DAppClient signing implementation
DAppClient.prototype.requestSignPayload = mockSign;

const genClient = async (): Promise<DAppClient> => {
    const ims = new InMemorySigner(b58cencode(
        crypto.randomBytes(32),
        prefix.edsk2
    ));
    // @ts-ignore
    return {
        // @ts-ignore
        getActiveAccount: async () => ({ publicKey: await ims.publicKey(), address: await ims.publicKeyHash() }),
        // @ts-ignore
        requestSignPayload: async ({ payload }) => ({ signature: await ims.sign(payload).then(res => res.prefixSig) })
    }
}
const create = async (hostURL: string = 'http://localhost:8000') => {
    const client = new Kepler(hostURL, await authenticator(await genClient(), 'test'))
    const res0 = await client.createOrbit({ hi: 'there' })
    expect(res0.status).toEqual(200)
    const res1 = await client.resolve(await res0.text())
    expect(res1.status).toEqual(200)
    return await expect(res1.json()).resolves.toEqual({ hi: 'there' })
}

describe('Kepler Client', () => {
    let authn: Authenticator;

    beforeAll(async () => {
        authn = await authenticator(new DAppClient({ name: "Test Client" }), 'test-domain');
    })

    it('Encodes strings correctly', () => expect(stringEncoder('message')).toBe('0501000000076d657373616765'))

    it('Creates auth tokens', async () => {
        const cid = 'uAYAEHiB0uGRNPXEMdA9L-lXR2MKIZzKlgW1z6Ug4fSv3LRSPfQ';
        const orbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
        const auth = await authn.content(orbit, [cid], Action.get)
    })

    it('Generates correct orbit parameters', async () => {
        const params = ";address=tz1YSb7gXhgBw46nSXthhoSzhJdbQf9h92Gy;domain=kepler.tzprofiles.com;index=0"
        const pkh = "tz1YSb7gXhgBw46nSXthhoSzhJdbQf9h92Gy"
        const domain = "kepler.tzprofiles.com"

        return expect(orbitParams({ address: pkh, domain, index: 0 })).toEqual(params)
    })

    it('Generates correct orbit IDs', async () => {
        const oid = "zCT5htkeBtA6Qu5YF4vPkQcfeqy3pY4m8zxGdUKUiPgtPEbY3rHy"
        const pkh = "tz1YSb7gXhgBw46nSXthhoSzhJdbQf9h92Gy"
        const domain = "kepler.tzprofiles.com"

        return await expect(getOrbitId(pkh, { domain, index: 0 })).resolves.toEqual(oid)
    })

    it('sequential load', async () => {
        const len = 1000
        for (let i = 0; i < len; i++) {
            await create()
        }
    })

    it('concurrent load', async () => {
        const len = 1000
        const p = []
        for (let i = 0; i < len; i++) {
            p.push(create())
        }
        await Promise.all(p)
    })

    it('naive integration test', async () => {
        const kepler = new Kepler('http://localhost:8000', authn);

        const json = { hello: 'hey' };
        const uri = await kepler.createOrbit(json).then(async res => res.text());

        await expect(kepler.resolve(uri).then(async (res) => await res.json())).resolves.toEqual(json)
    })

    it('naive integration multipart test', async () => {
        const kepler = new Kepler('https://faad7ca90d6c.ngrok.io', authn);
        const orbit = kepler.orbit('uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA');
        const fakeCid = "not_a_cid";

        const json1 = { hello: 'hey' };
        const json2 = { hello: 'hey again' };

        await expect(orbit.get(fakeCid).then(res => res.status)).resolves.toEqual(200);

        const cids = await orbit.put(json1, json2);
        console.log(cids)

        // await expect(orbit.get(cid)).resolves.toEqual(json)
        // return await expect(orbit.del(cid)).resolves.not.toThrow()
    })
})
