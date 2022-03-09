import { SiweMessage } from 'siwe';
import { Signer } from 'ethers';
import { base64url } from 'rfc4648';
import { Authenticator, Action, getOrbitId, orbitParams, makeKRI } from '.';
import { Delegation } from '@spruceid/zcap-providers';
import { getHeaderAndDelId } from './zcap';

const invHeaderStr = "x-siwe-invocation";

export const siweAuthenticator = async <S extends Signer, D>(orbit: string, client: S, domain: string, chainId: string = '1', delegation?: Delegation<D> | SiweMessage): Promise<Authenticator> => {
    const pkh = await client.getAddress();
    const { h, delId } = getHeaderAndDelId(delegation);

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const auth = createSiweAuthContentMessage(orbit, pkh, action, cids, domain, chainId, delId);
            const signature = await client.signMessage(auth);
            const invstr = base64url.stringify(new TextEncoder().encode(JSON.stringify([auth, signature])));
            return { [invHeaderStr]: invstr, ...h } as {}
        },
        authorizePeer: async (orbit: string, peer: string): Promise<HeadersInit> => {
            const auth = createSiweAuthCreationMessage(orbit, pkh, peer, domain, chainId)
            const signature = await client.signMessage(auth);
            const invstr = base64url.stringify(new TextEncoder().encode(JSON.stringify([auth, signature])));
            return { [invHeaderStr]: invstr }
        }
    }
}

const statement = "Authorize an action on your Kepler Orbit";
const version = "1";

const createSiweAuthContentMessage = (orbit: string, address: string, action: Action, paths: string[], domain: string, chainId: string, del?: string) => {
    const now = Date.now();
    return new SiweMessage({
        domain, address, statement, version, chainId,
        issuedAt: new Date(now).toISOString(),
        expirationTime: new Date(now + 10000).toISOString(),
        resources: paths.map(path => getKRI(orbit, path, action.toLowerCase())),
        uri: del ? `urn:siwe:kepler:{del}` : orbit
    }).toMessage()
}

const createSiweAuthCreationMessage = (
    did: string,
    name: string,
    address: string,
    peer: string,
    domain: string,
    chainId: string,
    opts: SessionOptions = { nbf: new Date(), exp: new Date(Date.now() + 120000) }
) => new SiweMessage({
        domain, address, version, chainId,
        statement: 'Authorize this provider to host your Orbit',
        issuedAt: opts.nbf || new Date().toISOString(),
        expirationTime: opts.exp || new Date(Date.now() + 120000).toISOString(),
        resources: [make],
    uri: peer
    }).toMessage()

type SessionOptions = {
    nbf?: Date,
    exp?: Date
};

const millisecondsFromNow = (ms: number) => new Date(Date.now() + ms);

export const startSIWESession = async (orbit: string, domain: string, chainId: string, delegator: string, delegate: string, actions: string[] = ['get'], opts: SessionOptions = { exp: millisecondsFromNow(120000) }) => new SiweMessage({
    domain,
    address: delegator,
    statement: `Allow ${domain} to access your orbit using their temporary session key: ${delegate}`,
    uri: delegate,
    resources: actions.map(action => `kepler://${orbit}#${action}`),
    version,
    chainId,
    ...(opts.exp ? { expirationTime: opts.exp.toISOString() } : {}),
    ...(opts.nbf ? { notBefore: opts.nbf.toISOString() } : {})
})
