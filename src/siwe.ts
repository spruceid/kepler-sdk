import { SiweMessage } from 'siwe';
import { Signer } from 'ethers';
import { base64url } from 'rfc4648';
import { Authenticator, Action, getOrbitId, orbitParams } from '.';
import { Delegation } from '@spruceid/zcap-providers';
import { getHeaderAndDelId } from './zcap';

export const siweAuthenticator = async <S extends Signer, D>(client: S, domain: string, chainId: string = '1', delegation?: Delegation<D> | SiweMessage): Promise<Authenticator> => {
    const pkh = await client.getAddress();
    const { h, delId } = getHeaderAndDelId(delegation);

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const auth = createSiweAuthContentMessage(orbit, pkh, action, cids, domain, chainId);
            const signature = await client.signMessage(auth);
            const invstr = base64url.stringify(new TextEncoder().encode(JSON.stringify([auth, signature])));
            return { "X-Siwe-Invocation": invstr, ...h } as {}
        },
        createOrbit: async (cids: string[], params: { [key: string]: number | string }): Promise<{ headers: HeadersInit, oid: string }> => {
            const { oid, auth } = await createSiweAuthCreationMessage(pkh, cids, domain, params, chainId)
            const signature = await client.signMessage(auth);
            const invstr = base64url.stringify(new TextEncoder().encode(JSON.stringify([auth, signature])));
            return { headers: { "X-Siwe-Invocation": invstr }, oid }
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
        resources: cids.map(cid => `kepler://${orbit}/${cid}#${action}`),
        uri: `kepler://${orbit}`
    }).toMessage()
}

const createSiweAuthCreationMessage = async (address: string, cids: string[], domain: string, params: { [key: string]: number | string }, chainId: string) => {
    const now = Date.now();
    const paramsStr = orbitParams({ did: `did:pkh:eip155:${chainId}:${address}`, vm: "blockchainAccountId", ...params });
    const oid = await getOrbitId("did", paramsStr);
    const auth = new SiweMessage({
        domain, address, version, chainId,
        statement: 'Authorize this provider to host your Orbit',
        issuedAt: new Date(now).toISOString(),
        expirationTime: new Date(now + 10000).toISOString(),
        resources: [`kepler://${oid}#host`, ...cids.map(cid => `kepler://${oid}/${cid}#put`)],
        uri: `kepler://did${paramsStr}`
    }).toMessage();
    return { oid, auth }
}

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
