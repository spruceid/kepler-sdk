import { prepareInvokeCapability, completeInvokeCapability } from 'didkit-wasm';

type Preperation = {};

const invProps = (capabilityAction: string = 'Read') => ({
    "@context": "https://w3id...",
    id: "urn",
    capabilityAction
})

const sigProps = (did: string, eip712: any) => ({
    verificationMethod: did + '#Recovery2020',
    proofPurpose: 'capabilityInvocation',
    eip712Domain: {
        primaryType: "CapabilityInvocation",
        domain: {
            "name": "EthereumEip712Signature2021"
        },
        messageSchema: {
            "EIP712Domain": [
                { "name": "name", "type": "string" }
            ],
            "VerifiableCredential": [
                { "name": "@context", "type": "string[]" },
                { "name": "id", "type": "string" },
                { "name": "capabilityAction", "type": "string" },
                { "name": "proof", "type": "Proof" }
            ],
            "Proof": [
                { "name": "@context", "type": "string" },
                { "name": "verificationMethod", "type": "string" },
                { "name": "created", "type": "string" },
                { "name": "capability", "type": "string[]" },
                { "name": "proofPurpose", "type": "string" },
                { "name": "type", "type": "string" }
            ]
        }
    }
})



export const prepareInvocation = async (target_id: string, invProps: any, sigOpts: any, pk: any): Promise<Preperation> => {
    JSON.parse(await prepareInvokeCapability(JSON.stringify(invProps), target_id, JSON.stringify(sigOpts), JSON.stringify(pk))) as Preperation
}

export const completeInvocation = async (invProps: any, preperation: Preperation, signature: string): Promise<any> => {
    JSON.parse(await completeInvokeCapability(invProps, JSON.stringify(preperation), signature))
}
