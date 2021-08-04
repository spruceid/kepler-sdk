import { Authenticator, Action } from "."

type Preperation = any;

export const ethZcapAuthenticator = async (client: any, domain: string, prepareInvokeCapability: any, completeInvokeCapability: any): Promise<Authenticator> => {
    const accounts = await client.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
        throw new Error("No Active Account")
    }
    // TODO Assuming only one account
    const pkh = accounts[0];

    const prepareInvocation = async (target_id: string, invProps: any, sigOpts: any, pk: any): Promise<Preperation> =>
        JSON.parse(await prepareInvokeCapability(JSON.stringify(invProps), target_id, JSON.stringify(sigOpts), JSON.stringify(pk))) as Preperation

    const completeInvocation = async (invProps: any, preperation: Preperation, signature: string): Promise<any> =>
        JSON.parse(await completeInvokeCapability(JSON.stringify(invProps), JSON.stringify(preperation), signature))

    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const inv = invProps(actionToKey(action, cids));
            const prep = await prepareInvocation(orbit, inv, sigProps(`did:pkh:eth:${pkh}`), keyProps);
            console.log(JSON.stringify(prep))
            if (!prep || prep.signingInput === undefined || prep.signingInput.primaryType === undefined) {
                console.log("Proof preparation:", prep);
                throw new Error("Expected EIP-712 TypedData");
            }
            const signature = await client.request({
                method: 'eth_signTypedData_v4',
                params: [pkh, JSON.stringify(prep.signingInput)],
            });
            return { "Invocation": JSON.stringify(await completeInvocation(inv, prep, signature)) }
        },
        createOrbit: async (cids: string[]): Promise<HeadersInit> => {
            const inv = invProps({ create: cids });
            const prep = await prepareInvocation("orbit_id", inv, sigProps(`did:pkh:eth:${pkh}`), keyProps);
            if (!prep || prep.signingInput === undefined || prep.signingInput.primaryType === undefined) {
                console.log("Proof preparation:", prep);
                throw new Error("Expected EIP-712 TypedData");
            }
            const signature = await client.request({
                method: 'eth_signTypedData_v4',
                params: [pkh, JSON.stringify(prep.signingInput)],
            });
            return { "Invocation": JSON.stringify(await completeInvocation(inv, prep, signature)) }
        }
    }
}

const keyProps = { "kty": "EC", "crv": "secp256k1", "alg": "ES256K-R", "key_ops": ["signTypedData"] };

enum ContentActionKeys {
    get = 'get',
    put = 'put',
    del = 'del'
}

type CapContentAction = {[K in ContentActionKeys]?: string[]}
type CapOrbitAction = 'list' | { create: string[] }

const actionToKey = (action: Action, cids: string[]): CapContentAction | 'list' => {
    switch (action) {
            case Action.get:
                return { [ContentActionKeys.get]: cids}
            case Action.put:
                return { [ContentActionKeys.put]: cids}
            case Action.delete:
                return { [ContentActionKeys.del]: cids}
            case Action.list:
                return 'list'
    }
}

const invProps = (capabilityAction: CapContentAction | CapOrbitAction = 'list') => ({
    "@context": "https://w3id.org/security/v2",
    // TODO unique
    id: "urn:uuid:helo",
    capabilityAction
})

const sigProps = (did: string) => ({
    // type: "EthereumEip712Signature2021",
    verificationMethod: did + '#Recovery2020',
    proofPurpose: 'assertionMethod',
    eip712Domain: {
        primaryType: "CapabilityInvocation",
        domain: {
            "name": "EthereumEip712Signature2021"
        },
        messageSchema: {
            "EIP712Domain": [
                { "name": "name", "type": "string" }
            ],
            "CapabilityInvocation": [
                { "name": "@context", "type": "string" },
                { "name": "id", "type": "string" },
                { "name": "capabilityAction", "type": "string" },
                { "name": "proof", "type": "Proof" }
            ],
            "Proof": [
                { "name": "@context", "type": "string" },
                { "name": "verificationMethod", "type": "string" },
                { "name": "created", "type": "string" },
                { "name": "capability", "type": "string" },
                { "name": "proofPurpose", "type": "string" },
                { "name": "type", "type": "string" }
            ]
        }
    }
})
