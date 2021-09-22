import { DAppClient, SigningType } from '@airgap/beacon-sdk';
import { Authenticator, Action, getOrbitId, orbitParams } from '.';

export const tzStringAuthenticator = async <D extends DAppClient>(client: D, domain: string): Promise<Authenticator> => {
    const { publicKey: pk, address: pkh } = await client.getActiveAccount().then(acc => {
        if (acc === undefined) {
            throw new Error("No Active Account")
        }
        return acc
    });

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const auth = createTzAuthContentMessage(orbit, pk, pkh, action, cids, domain);
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(auth)
            });
            return { "Authorization": auth + " " + signature }
        },
        createOrbit: async (cids: string[]): Promise<HeadersInit> => {
            const auth = await createTzAuthCreationMessage(pk, pkh, cids, { domain, index: 0 })
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(auth)
            });
            return { "Authorization": auth + " " + signature }
        }
    }
}

const createTzAuthContentMessage = (orbit: string, pk: string, pkh: string, action: Action, cids: string[], domain: string): string =>
    `Tezos Signed Message: ${domain} ${(new Date()).toISOString()} ${pk} ${pkh} ${orbit} ${action} ${cids.join(' ')}`

const createTzAuthCreationMessage = async (pk: string, pkh: string, cids: string[], params: { domain: string; salt?: string; index?: number; }): Promise<string> =>
    `Tezos Signed Message: ${params.domain} ${(new Date()).toISOString()} ${pk} ${pkh} ${await getOrbitId("tz", { address: pkh, ...params })} CREATE tz${orbitParams(params)} ${cids.join(' ')}`

export const stringEncoder = (s: string): string => {
    const bytes = Buffer.from(s, 'utf8');
    return `0501${toPaddedHex(bytes.length)}${bytes.toString('hex')}`
}

const toPaddedHex = (n: number, padLen: number = 8, padChar: string = '0'): string =>
    n.toString(16).padStart(padLen, padChar)
