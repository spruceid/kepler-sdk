import { Kepler, Orbit, Action, stringEncoder } from './';
import { InMemorySigner } from '@taquito/signer'

const signer = new InMemorySigner('edsk2gL9deG8idefWJJWNNtKXeszWR4FrEdNFM5622t1PkzH66oH3r');

describe('Kepler Client', () => {
    it('Encodes strings correctly', () => expect(stringEncoder('message')).toBe('0501000000076d657373616765'))

    it('Creates auth tokens', async () => {
        let kepler = new Kepler("https://example.com", signer);

        // @ts-ignore
        let auth = await kepler.createAuth("fake_orbit", "fake_cid", Action.get)
        console.log(auth)
    })
})
