import { SimpleKepler, Orbit } from './';
import fetch from 'cross-fetch';
import Blob from 'fetch-blob';
import { Wallet } from 'ethers';

describe('Kepler Client', () => {
    let orbit: Orbit;
    beforeAll(async () => {
        (global as any).window = { location: { hostname: "example.com" } };
        (global as any).fetch = fetch;
        const wallet: Wallet = Wallet.createRandom();
        wallet.getChainId = () => Promise.resolve(1);
        orbit = await new SimpleKepler(wallet, ["http://localhost:8000"]).orbit();
    })

    it('put & get plaintext', async () => {
        let key = 'plaintext';
        // @ts-ignore
        await orbit.put(key, new Blob(['value'], {type: 'text/plain'}))
            .then(() => orbit.get(key))
            .then((response: Response) => response.text())
            .then((value) => expect(value).toEqual('value'));
    })

    it('put & get json', async () => {
        let key = 'json';
        let obj = {some: 'object', with: 'properties'};
        // @ts-ignore
        await orbit.put(key, new Blob([JSON.stringify(obj)], {type: 'application/json'}))
            .then(() => orbit.get(key))
            .then((response: Response) => response.json())
            .then((value) => expect(value).toEqual(obj));
    })

    it('put & get blob', async () => {
        let key = 'blob';
        let blob = new Blob(['value'], {type: 'text/plain'});
        // @ts-ignore
        await orbit.put(key, blob)
            .then(() => orbit.get(key))
            .then((response: Response) => response.blob())
            .then((blob) => blob.text())
            .then((value) => expect(value).toEqual('value'));
    })

    it('list & delete', async () => {
        let key = 'listAndDelete';
        let value = 'value';
        // @ts-ignore
        await orbit.put(key, new Blob([value], 'text/plain'))
            .then(() => orbit.list())
            .then((response) => response.json())
            .then((list) => expect(list).toContain(key))
            .then(() => orbit.delete(key))
            .then(() => orbit.list())
            .then((response) => response.json())
            .then((list) => expect(list).not.toContain(key))
    })
})
