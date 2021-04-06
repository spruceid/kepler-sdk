import { Kepler, Orbit, Action, stringEncoder } from './';
import { InMemorySigner } from '@taquito/signer'

const signer = new InMemorySigner('edsk2gL9deG8idefWJJWNNtKXeszWR4FrEdNFM5622t1PkzH66oH3r');

describe('Kepler Client', () => {
    it('Encodes strings correctly', () => expect(stringEncoder('message')).toBe('0501000000076d657373616765'))

    it('Creates auth tokens', async () => {
        let kepler = new Kepler("https://example.com", signer);
        const cid = 'uAYAEHiB0uGRNPXEMdA9L-lXR2MKIZzKlgW1z6Ug4fSv3LRSPfQ';
        const orbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
        // @ts-ignore
        let auth = await kepler.createAuth(orbit , cid, Action.get)
        console.log(auth)
    })

    it('naive integration test', async () => {
        let kepler = new Kepler('http://localhost:8000', signer);
        const cid = 'uAYAEHiB0uGRNPXEMdA9L-lXR2MKIZzKlgW1z6Ug4fSv3LRSPfQ';
        const orbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';

        const json = { hello: 'hey' };

        await kepler.put(json, orbit, cid);

        return await expect(kepler.get(orbit, cid)).resolves.toEqual(json)
    })
})
