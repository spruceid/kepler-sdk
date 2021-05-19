import { Kepler, Orbit, Action, Authenticator, authenticator, stringEncoder, getOrbitId } from './';
import { DAppClient } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import * as path from 'path';

const ims = new InMemorySigner('edsk2gL9deG8idefWJJWNNtKXeszWR4FrEdNFM5622t1PkzH66oH3r');
const mockAccount = jest.fn(async () => ({ publicKey: await ims.publicKey(), address: await ims.publicKeyHash() }));
const mockSign = jest.fn(async ({ payload }) => ({ signature: await ims.sign(payload).then(res => res.prefixSig) }));
const testDomain = 'kepler.tzprofiles.com'

const buildContext = path.resolve(__dirname, '..');
const dockerfile = 'test.Dockerfile';
const keplerPort = 8000;
const keplerTempFs = '/temp';

// @ts-ignore, mock DAppClient account info
DAppClient.prototype.getActiveAccount = mockAccount;

// @ts-ignore, mock DAppClient signing implementation
DAppClient.prototype.requestSignPayload = mockSign;

describe('Kepler Client', () => {
    let authn: Authenticator;
    let keplerContainer: StartedTestContainer;
    let keplerUrl: string;

    beforeAll(async () => {
        authn = await authenticator(new DAppClient({ name: "Test Client" }), testDomain);

        keplerContainer = await GenericContainer.fromDockerfile(buildContext, dockerfile)
            .build()
            .then(async c => await c.withExposedPorts(keplerPort)
                .withTmpFs({ [keplerTempFs]: "" })
                .withEnv('KEPLER_DATABASE_PATH', keplerTempFs)
                .start())

        keplerUrl = "http://" + keplerContainer.getHost() + ":" + keplerPort
        console.log(keplerUrl)

        await keplerContainer.logs().then(stream => {
            stream.on('data', line => console.log(line));
            stream.on('err', line => console.error(line));
            stream.on('end', () => console.log("Kepler container stream closed"));
        })
        // 10 minute time limit for building the container
    }, 600000)

    afterAll(async () => {
        await keplerContainer.stop()
        // 1 minute time limit for stopping the container
    }, 60000)

    it('Encodes strings correctly', () => expect(stringEncoder('message')).toBe('0501000000076d657373616765'))

    it('Creates auth tokens', async () => {
        const cid = 'uAYAEHiB0uGRNPXEMdA9L-lXR2MKIZzKlgW1z6Ug4fSv3LRSPfQ';
        const orbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
        const auth = await authn.content(orbit, [cid], Action.get)
    })

    it('Generates correct orbit IDs', async () => {
        const oid = "zCT5htkeE1yGCAKVUL8WGLptEGJ5EwLV3i25RjRPhPUsQYGQpjX9"
        const pkh = "tz1YSb7gXhgBw46nSXthhoSzhJdbQf9h92Gy"

        return await expect(getOrbitId(pkh, { domain: testDomain, index: 0 })).resolves.toEqual(oid)
    })

    it('naive integration test', async () => {
        const kepler = new Kepler(keplerUrl, authn);

        const json = { hello: 'hey' };
        const uri = await kepler.createOrbit(json).then(async res => res.text());

        await expect(kepler.resolve(uri).then(async (res) => await res.json())).resolves.toEqual(json)
    })

    it('naive integration multipart test', async () => {
        const kepler = new Kepler(keplerUrl, authn);
        const orbit = kepler.orbit(await getOrbitId(await ims.publicKeyHash(), { domain: testDomain, index: 0 }));
        const fakeCid = "not_a_cid";

        const json0 = { hello: 'hey' };
        const json1 = { hello: 'hey again' };

        await expect(orbit.get(fakeCid).then(res => res.status)).resolves.toEqual(404);

        const uris = await orbit.put(json0, json1).then(async res => await res.text()).then(t => t.split("\n"));
        console.log(uris)
        const cid = uris[0].split("/").slice(-1)[0]

        await expect(orbit.get(uris[0]).then(async res => await res.json())).resolves.toEqual(json0)
        await expect(orbit.get(uris[1]).then(async res => await res.json())).resolves.toEqual(json1)

        await expect(orbit.del(cid)).resolves.not.toThrow()
        await expect(orbit.get(uris[0]).then(async res => res.status)).resolves.toEqual(404)
    })
})
