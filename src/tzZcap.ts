import { invProps, actionToKey } from './zcap';
import { stringEncoder } from './tzString';

import { DAppClient, SigningType } from '@airgap/beacon-sdk';
import { Authenticator, Action, getOrbitId, orbitParams } from '.';
import { base64url } from 'rfc4648';

type Preperation = any;

export const tzZcapAuthenticator = async <D extends DAppClient>(client: D, prepareInvokeCapability: any, completeInvokeCapability: any, keyProps: any): Promise<Authenticator> => {
    const { publicKey: pk, address: pkh } = await client.getActiveAccount().then(acc => {
        if (acc === undefined) {
            throw new Error("No Active Account")
        }
        return acc
    });
    const jwk = await keyProps(pk);
    const ldpProps = JSON.stringify(sigProps(`did:pkh:tz:${pkh}`));

    const prepareInvocation = async (target_id: string, invProps: any): Promise<Preperation> =>
        JSON.parse(await prepareInvokeCapability(JSON.stringify(invProps), target_id, ldpProps, jwk)) as Preperation

    const completeInvocation = async (invProps: any, preperation: Preperation, signature: string): Promise<any> =>
        JSON.parse(await completeInvokeCapability(JSON.stringify(invProps), JSON.stringify(preperation), signature))

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const inv = invProps(orbit, actionToKey(action, cids));
            const prep = await prepareInvocation("kepler://" + orbit, inv);
            if (!prep || prep.signingInput === undefined || prep.signingInput.micheline === undefined) {
                throw new Error("Missing Signing Input");
            }
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: prep.signingInput.micheline
            });
            const invBytes = new TextEncoder().encode(JSON.stringify(await completeInvocation(inv, prep, signature)));
            return { "X-Kepler-Invocation": base64url.stringify(invBytes) }
        },
        createOrbit: async (cids: string[]): Promise<HeadersInit> => {
            const inv = invProps("orbit_id", { create: cids });
            // TODO need orbit id here
            const prep = await prepareInvocation("kepler://orbit_id", inv);
            if (!prep || prep.signingInput === undefined) {
                console.log("Proof preparation:", prep);
                throw new Error("Missing Signing Input");
            }
            const { signature } = await client.requestSignPayload({
                signingType: SigningType.MICHELINE,
                payload: stringEncoder(prep.signingInput)
            });
            return { "Invocation": JSON.stringify(await completeInvocation(inv, prep, signature)) }
        }
    }
}

export const sigProps = (did: string) => ({
    verificationMethod: did + '#TezosMethod2021',
    proofPurpose: 'capabilityInvocation',
    type: 'TezosSignature2021'
})
