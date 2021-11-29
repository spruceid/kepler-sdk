import { SiweMessage } from 'siwe';
import { Signer } from 'ethers';
import { Authenticator, Action, getOrbitId, orbitParams } from '.';

export const SIWEAuthenticator = async <S extends Signer>(client: S, domain: string, chainId: string = '1'): Promise<Authenticator> => {
    const pkh = await client.getAddress();

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const auth = createSiweAuthContentMessage(orbit, pkh, action, cids, domain, chainId);
            const signature = await client.signMessage(auth);
            return { "Authorization": auth + " " + signature }
        },
        createOrbit: async (cids: string[], params: { [key: string]: number | string }): Promise<{ headers: HeadersInit, oid: string }> => {
            const { oid, auth } = createSiweAuthCreationMessage(pkh, cids, domain, params)
            const signature = await client.signMessage(auth);
            return { headers: { "Authorization": auth + " " + signature }, oid }
        }
    }
}

const statement = "Authorize an action on your Kepler Orbit";
const version = "1";

const createSiweAuthContentMessage = (orbit: string, address: string, action: Action, cids: string[], domain: string, chainId: string) => {
    const now = Date.now();
    return new SiweMessage({
        domain, address, statement, version, chainId,
        issuedAt: new Date(now).toISOString(),
        expirationTime: new Date(now + 10000).toISOString(),
        resources: cids.map(cid => `/${orbit}/${cid}/${action}`),
        uri: `kepler://${orbit}`
    }).toMessage()
}

const createSiweAuthCreationMessage = (pkh: string, cids: string[], domain: string, params: { [key: string]: number | string }) => ({ oid: '', auth: '' })
