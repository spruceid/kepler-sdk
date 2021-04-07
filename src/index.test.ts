import { Kepler, Orbit, Action, TezosAuthenticator, stringEncoder } from './';
import { InMemorySigner } from '@taquito/signer'

const authn = new TezosAuthenticator(new InMemorySigner('edsk2gL9deG8idefWJJWNNtKXeszWR4FrEdNFM5622t1PkzH66oH3r'));

describe('Kepler Client', () => {
    it('Encodes strings correctly', () => expect(stringEncoder('message')).toBe('0501000000076d657373616765'))

    it('Creates auth tokens', async () => {
        const cid = 'uAYAEHiB0uGRNPXEMdA9L-lXR2MKIZzKlgW1z6Ug4fSv3LRSPfQ';
        const orbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
        const auth = await authn.authenticate(orbit , cid, Action.get)
    })

    it('naive integration test', async () => {
        const kepler = new Kepler('https://1cee80b0acd8.ngrok.io', authn);
        const orbit = kepler.orbit('uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA');
        const fakeCid = "not_a_cid";

        const json = { hello: 'hey' };

        await expect(orbit.get(fakeCid)).rejects.toBeDefined();

        const cid = await orbit.put(json);

        await expect(orbit.get(cid)).resolves.toEqual(json)
        return await expect(orbit.del(cid)).resolves.not.toThrow()
    })
})
