import { Kepler, Orbit, Action, Authenticator, authenticator, stringEncoder } from './';
import { DAppClient } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';

const ims = new InMemorySigner('edsk2gL9deG8idefWJJWNNtKXeszWR4FrEdNFM5622t1PkzH66oH3r');
const mockAccount = jest.fn(async () => ({ publicKey: await ims.publicKey(), address: await ims.publicKeyHash() }))
const mockSign = jest.fn(async ({ payload }) => ({ signature: await ims.sign(payload).then(res => res.prefixSig) }))

// @ts-ignore, mock DAppClient account info
DAppClient.prototype.getActiveAccount = mockAccount;

// @ts-ignore, mock DAppClient signing implementation
DAppClient.prototype.requestSignPayload = mockSign;

describe('Kepler Client', () => {
    let authn: Authenticator;

    beforeAll(async () => {
        authn = await authenticator(new DAppClient({ name: "Test Client" }));
    })

    it('Encodes strings correctly', () => expect(stringEncoder('message')).toBe('0501000000076d657373616765'))

    it('Creates auth tokens', async () => {
        const cid = 'uAYAEHiB0uGRNPXEMdA9L-lXR2MKIZzKlgW1z6Ug4fSv3LRSPfQ';
        const orbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
        const auth = await authn(orbit, cid, Action.get)
    })

    it('naive integration test', async () => {
        const kepler = new Kepler('https://faad7ca90d6c.ngrok.io', authn);
        const orbit = kepler.orbit('uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA');
        const fakeCid = "not_a_cid";

        const json = { hello: 'hey' };

        await expect(orbit.get(fakeCid)).rejects.toBeDefined();

        const cid = await orbit.put(json).then(async (res) => await res.text());

        await expect(orbit.get(cid).then(async (res) => await res.json())).resolves.toEqual(json)
        return await expect(orbit.del(cid).then(res => res.status)).resolves.toEqual(200)
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
