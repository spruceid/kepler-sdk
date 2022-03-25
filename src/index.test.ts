import { SimpleKepler, OrbitConnection } from './';
import fetch from 'cross-fetch';
import Blob from 'fetch-blob';
import { Wallet } from 'ethers';

function expectSuccess(response: Response): Response {
    expect(response.status).toBe(200);
    return response
}

function expectUnauthorised(response: Response): Response {
    expect(response.status).toBe(401);
    return response
}

describe('Kepler Client', () => {
    let orbit: OrbitConnection;
    const keplerConfig = { hosts: ["http://localhost:8000"] };

    beforeAll(async () => {
        (global as any).window = { location: { hostname: "example.com" } };
        (global as any).fetch = fetch;

        const wallet: Wallet = Wallet.createRandom();
        wallet.getChainId = () => Promise.resolve(1);
        orbit = await new SimpleKepler(wallet, keplerConfig).orbit();
    })

    it('can put & get plaintext', async () => {
        let key = 'plaintext';
        // @ts-ignore
        await orbit.put(key, new Blob(['value'], {type: 'text/plain'}))
            .then(expectSuccess)
            .then(() => orbit.get(key))
            .then(expectSuccess)
            .then((response: Response) => response.text())
            .then((value) => expect(value).toEqual('value'));
    })

    it('can put & get json', async () => {
        let key = 'json';
        let obj = {some: 'object', with: 'properties'};
        // @ts-ignore
        await orbit.put(key, new Blob([JSON.stringify(obj)], {type: 'application/json'}))
            .then(expectSuccess)
            .then(() => orbit.get(key))
            .then(expectSuccess)
            .then((response: Response) => response.json())
            .then((value) => expect(value).toEqual(obj));
    })

    it('can put & get blob', async () => {
        let key = 'blob';
        let blob = new Blob(['value'], {type: 'text/plain'});
        // @ts-ignore
        await orbit.put(key, blob)
            .then(expectSuccess)
            .then(() => orbit.get(key))
            .then(expectSuccess)
            .then((response: Response) => response.blob())
            .then((blob) => blob.text())
            .then((value) => expect(value).toEqual('value'));
    })

    it('can list & delete', async () => {
        let key = 'listAndDelete';
        let value = 'value';
        // @ts-ignore
        await orbit.put(key, new Blob([value], {type: 'text/plain'}))
            .then(expectSuccess)
            .then(() => orbit.list())
            .then(expectSuccess)
            .then((response) => response.json())
            .then((list) => expect(list).toContain(key))
            .then(() => orbit.delete(key))
            .then(expectSuccess)
            .then(() => orbit.list())
            .then(expectSuccess)
            .then((response) => response.json())
            .then((list) => expect(list).not.toContain(key))
    })

    it('can retrieve content-type', async () => {
        let key = 'headContentType';
        // @ts-ignore
        await orbit.put(key, new Blob(['data'], {type: 'image/gif'}))
            .then(expectSuccess)
            .then(() => orbit.head(key))
            .then(expectSuccess)
            .then(({headers}) => headers.get('content-type'))
            .then(cType => expect(cType).toEqual('image/gif'));
    })

    it('undelegated account cannot access a different orbit', async () => {
        const undelegatedWallet: Wallet = Wallet.createRandom();
        undelegatedWallet.getChainId = () => Promise.resolve(1);
        await new SimpleKepler(undelegatedWallet, keplerConfig).orbit({ orbit: orbit.id() })
            .then(orbit => orbit.list())
            .then(expectUnauthorised);
    })

    it('expired session key cannot be used', async () => {
        const timedOutWallet: Wallet = Wallet.createRandom();
        timedOutWallet.getChainId = () => Promise.resolve(1);
        await new SimpleKepler(timedOutWallet, keplerConfig).orbit({ sessionOpts: { exp: new Date(Date.now() - (1000 * 60 * 60)) } })
            .then(orbit => orbit.list())
            .then(expectUnauthorised);
    })
    
    it('only allows properly authorised actions', async () => {
        const wallet = Wallet.createRandom();
        wallet.getChainId = async () => Promise.resolve(1);
        const kepler = new SimpleKepler(wallet, keplerConfig);
        const write = await kepler.orbit({ actions: ['put', 'del'] });
        const read = await kepler.orbit({ actions: ['get', 'list'] });

        const key = 'key';
        const json = { hello: 'hey' };
        const json2 = { hello: 'hey2' };

        // writer can write
        // @ts-ignore
        await write.put(key, new Blob([JSON.stringify(json)], { type: 'application/json' }))
            .then(expectSuccess);

        // reader can list
        await read.list()
            .then(expectSuccess)
            .then(response => response.json())
            .then(({ length }) => expect(length).toBe(1));
        // reader can read
        await read.get(key)
            .then(expectSuccess)
            .then(response => response.json())
            .then(got => expect(got).toEqual(json));
        // reader cant write
        // @ts-ignore
        await read.put(key, new Blob([JSON.stringify(json2)], { type: 'application/json' }))
            .then(expectUnauthorised);
        // reader cant delete
        await read.delete(key)
            .then(expectUnauthorised);

        // writer cant list
        await write.list()
            .then(expectUnauthorised);
        // writer cant read
        await write.get(key)
            .then(expectUnauthorised);
        // writer can delete
        await write.delete(key)
            .then(expectSuccess);
    })
})
