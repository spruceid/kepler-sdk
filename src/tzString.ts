import { DAppClient, SigningType } from '@airgap/beacon-sdk';
import { Authenticator } from './authenticator';
import { getKRI } from './util';

const tzStringAuthenticator = async <D extends DAppClient>(client: D, domain: string): Promise<Authenticator> => {
    const { publicKey: pk, address: pkh } = await client.getActiveAccount().then(acc => {
        if (acc === undefined) {
            throw new Error("No Active Account")
        }
        return acc
    });

    return {
        content: async (orbit: string, service: string, path: string, fragment: string): Promise<HeadersInit> => {
            const target = getKRI(orbit, service, path, fragment);
            const auth = createTzAuthContentMessage(target, pk, pkh, domain);
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(auth)
            });
            return { "Authorization": auth + " " + signature }
        },
        authorizePeer: async (orbit: string, peer: string): Promise<HeadersInit> => {
            const auth = await createTzAuthCreationMessage(orbit, pk, pkh, domain, peer)
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(auth)
            });
            return { "Authorization": auth + " " + signature }
        }
    }
}

const createTzAuthContentMessage = (target: string, pk: string, pkh: string, domain: string): string =>
    `Tezos Signed Message: ${domain} ${(new Date()).toISOString()} ${pk} ${pkh} ${target}`

const createTzAuthCreationMessage = async (orbit: string, pk: string, pkh: string, domain: string, peer: string): Promise<string> =>
    `Tezos Signed Message: ${domain} ${(new Date()).toISOString()} ${pk} ${pkh} ${orbit}#peer ${peer}`

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}

const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)
