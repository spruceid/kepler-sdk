import { invProps, actionToKey } from './zcap';
import { stringEncoder } from './tzString';

import { DAppClient, SigningType } from '@airgap/beacon-sdk';
import { Authenticator, Action, getOrbitId, orbitParams } from '.';

type Preperation = any;

export const TzZcapAuthenticator = async <D extends DAppClient>(client: D, prepareInvokeCapability: any, completeInvokeCapability: any): Promise<Authenticator> => {
    const { publicKey: pk, address: pkh } = await client.getActiveAccount().then(acc => {
        if (acc === undefined) {
            throw new Error("No Active Account")
        }
        return acc
    });

    const prepareInvocation = async (target_id: string, invProps: any, sigOpts: any, pk: any): Promise<Preperation> =>
        JSON.parse(await prepareInvokeCapability(JSON.stringify(invProps), target_id, JSON.stringify(sigOpts), JSON.stringify(pk))) as Preperation

    const completeInvocation = async (invProps: any, preperation: Preperation, signature: string): Promise<any> =>
        JSON.parse(await completeInvokeCapability(JSON.stringify(invProps), JSON.stringify(preperation), signature))

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const inv = invProps(actionToKey(action, cids));
            const prep = await prepareInvocation(orbit, inv, sigProps(`did:pkh:tz:${pkh}`), keyProps);
            console.log(JSON.stringify(prep))
            if (!prep || prep.signingInput === undefined) {
                console.log("Proof preparation:", prep);
                throw new Error("Expected EIP-712 TypedData");
            }

            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(prep.signingInput)
            });
            return { "Invocation": JSON.stringify(await completeInvocation(inv, prep, signature)) }
        },
        createOrbit: async (cids: string[]): Promise<HeadersInit> => {
            const inv = invProps({ create: cids });
            // TODO need orbit id here
            const prep = await prepareInvocation("orbit_id", inv, sigProps(`did:pkh:tz:${pkh}`), keyProps);
            if (!prep || prep.signingInput === undefined) {
                console.log("Proof preparation:", prep);
                throw new Error("Expected EIP-712 TypedData");
            }
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(prep.signingInput)
            });
            return { "Invocation": JSON.stringify(await completeInvocation(inv, prep, signature)) }
        }
    }
}

const keyProps = { "kty": "EC", "crv": "secp256k1", "alg": "ES256K-R", "key_ops": ["signTypedData"] };

const sigProps = (did: string) => ({
    verificationMethod: did + '#BlockchainId',
    proofPurpose: 'capabilityInvocation',
})
