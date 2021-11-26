import { SiweMessage } from 'siwe';
import { ExternalProvider } from '@ethersproject/providers';
import { Authenticator, Action, getOrbitId, orbitParams } from '.';

type Provider = Required<Pick<ExternalProvider, 'request'>> & ExternalProvider;

export const SIWEAuthenticator = async <P extends Provider>(client: P, domain: string): Promise<Authenticator> => {
    if (typeof client.request !== 'function') {
        throw new Error("Client doesnt implement Eth provider functionality")
    }
    const accounts = await client.request({ method: 'eth_accounts' });
    const pkh = accounts ? accounts[0] : undefined;
    if (!pkh || typeof pkh !== 'string') {
        throw new Error("No Active Account")
    }

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const auth = createSiweAuthContentMessage(orbit, pkh, action, cids, domain);
            const signature = sign(client, new TextEncoder().encode(auth), pkh)
            return { "Authorization": auth + " " + signature }
        },
        createOrbit: async (cids: string[], params: { [key: string]: number | string }): Promise<{ headers: HeadersInit, oid: string }> => {
            const { oid, auth } = createSiweAuthCreationMessage(pkh, cids, domain, params)
            const signature = await sign(client, new TextEncoder().encode(auth), pkh);
            return { headers: { "Authorization": auth + " " + signature }, oid }
        }
    }
}

const HEX = "0123456789abcdef";

const hexEncode = (data: Uint8Array) => {
    let r = '';
    for (let i = 0; i < data.length; i++) {
        const v = data[i];
        r += HEX[(v & 0xf0) >> 4] + HEX[v & 0x0f];
    }
    return r
}

const sign = async <P extends Provider>(client: P, data: Uint8Array, address: string) =>
    await client.request({
        method: 'personal_sign',
        params: ["0x" + hexEncode(data), address]
    }).then(s => {
        if (typeof s === 'string') return s;
        else throw new Error("Failed to sign data")
    })

const statement = "Authorize an action on your Kepler Orbit";
const version = "1";
const chainId = "1";

const createSiweAuthContentMessage = (orbit: string, address: string, action: Action, cids: string[], domain: string) => {
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
