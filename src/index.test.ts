import { SimpleKepler, OrbitConnection } from './';
import fetch from 'cross-fetch';
import Blob from 'fetch-blob';
import { Wallet } from 'ethers';
import { contentType } from 'mime-types';

describe('Kepler Client', () => {
    let orbit: OrbitConnection;
    let undelegatedOrbit: OrbitConnection;
    let listlessOrbit: OrbitConnection;
    let timedOutOrbit: OrbitConnection;
    beforeAll(async () => {
        (global as any).window = { location: { hostname: "example.com" } };
        (global as any).fetch = fetch;

        const keplerConfig = { hosts: ["http://localhost:8000"] };
        const wallet: Wallet = Wallet.createRandom();
        wallet.getChainId = () => Promise.resolve(1);
        orbit = await new SimpleKepler(wallet, keplerConfig).orbit();

        const undelegatedWallet: Wallet = Wallet.createRandom();
        undelegatedWallet.getChainId = () => Promise.resolve(1);
        undelegatedOrbit = await new SimpleKepler(undelegatedWallet, keplerConfig).orbit({ orbit: orbit.id() });

        const actionlessWallet: Wallet = Wallet.createRandom();
        actionlessWallet.getChainId = () => Promise.resolve(1);
        listlessOrbit = await new SimpleKepler(actionlessWallet, keplerConfig).orbit({ actions: ['foo'] });

        const timedOutWallet: Wallet = Wallet.createRandom();
        timedOutWallet.getChainId = () => Promise.resolve(1);
        timedOutOrbit = await new SimpleKepler(timedOutWallet, keplerConfig).orbit({ sessionOpts: { exp: new Date(Date.now() - (1000 * 60 * 60)) } });
    })

    it('can put & get plaintext', async () => {
        let key = 'plaintext';
        // @ts-ignore
        await orbit.put(key, new Blob(['value'], {type: 'text/plain'}))
            .then(() => orbit.get(key))
            .then((response: Response) => response.text())
            .then((value) => expect(value).toEqual('value'));
    })

    it('can put & get json', async () => {
        let key = 'json';
        let obj = {some: 'object', with: 'properties'};
        // @ts-ignore
        await orbit.put(key, new Blob([JSON.stringify(obj)], {type: 'application/json'}))
            .then(() => orbit.get(key))
            .then((response: Response) => response.json())
            .then((value) => expect(value).toEqual(obj));
    })

    it('can put & get blob', async () => {
        let key = 'blob';
        let blob = new Blob(['value'], {type: 'text/plain'});
        // @ts-ignore
        await orbit.put(key, blob)
            .then(() => orbit.get(key))
            .then((response: Response) => response.blob())
            .then((blob) => blob.text())
            .then((value) => expect(value).toEqual('value'));
    })

    it('can list & delete', async () => {
        let key = 'listAndDelete';
        let value = 'value';
        // @ts-ignore
        await orbit.put(key, new Blob([value], {type: 'text/plain'}))
            .then(() => orbit.list())
            .then((response) => response.json())
            .then((list) => expect(list).toContain(key))
            .then(() => orbit.delete(key))
            .then(() => orbit.list())
            .then((response) => response.json())
            .then((list) => expect(list).not.toContain(key))
    })

    it('can retrieve content-type', async () => {
        let key = 'headContentType';
        // @ts-ignore
        await orbit.put(key, new Blob([], {type: 'image/gif'}))
            .then(() => orbit.head(key))
            .then(({headers}) => headers.get('content-type'))
            .then(cType => expect(cType).toEqual('image/gif'));
    })

    it('undelegated wallet cannot access a different orbit', async () => {
        await undelegatedOrbit.list()
            .then(({status}) => expect(status).toBe(401))
    })

    it('session key without action delegated cannot perform action', async () => {
        await listlessOrbit.list()
            .then(({status}) => expect(status).toBe(401))
    })

    it('expired session key cannot be used', async () => {
        await timedOutOrbit.list()
            .then(({status}) => expect(status).toBe(401))
    })
})
