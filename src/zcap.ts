import { base64url } from 'rfc4648';
import { Capabilities, W3ID_SECURITY_V2, randomId, Delegation } from '@spruceid/zcap-providers';
import { SiweMessage } from 'siwe';
import { getKRI } from './util';
import { Authenticator } from './authenticator';

const invHeaderStr = "x-kepler-invocation";

export const getHeaderAndDelId = <D>(delegation?: Delegation<D> | SiweMessage) => delegation instanceof SiweMessage ? {
    h: { "x-siwe-delegation": base64url.stringify(new TextEncoder().encode(JSON.stringify([delegation.toMessage(), delegation.signature]))) },
    delId: "urn:siwe:kepler:" + delegation.nonce
} : delegation ? {

    h: { "x-kepler-delegation": base64url.stringify(new TextEncoder().encode(JSON.stringify(delegation))) },
    delId: delegation.id
} : { h: {}, delId: "" }

export const zcapAuthenticator = async <C extends Capabilities, D>(client: C, delegation?: Delegation<D> | SiweMessage): Promise<Authenticator> => {
    const { h, delId } = getHeaderAndDelId(delegation);
    return {
        content: async (orbit: string, service: string, path: string, fragment: string): Promise<HeadersInit> => {
            const target = getKRI(orbit, service, path, fragment);
            const inv = await client.invoke(invProps(target), delId || orbit, randomId(), keplerContext);
            const invstr = base64url.stringify(new TextEncoder().encode(JSON.stringify(inv)));
            return {
                [invHeaderStr]: invstr,
                ...h
            } as {}
        },
        authorizePeer: async (orbit: string, peer: string): Promise<HeadersInit> => {
            const props = {
                invocationTarget: orbit,
            };
            const inv = await client.invoke(props, orbit, randomId(), keplerContext);
            const invBytes = new TextEncoder().encode(JSON.stringify(inv));
            return { [invHeaderStr]: base64url.stringify(invBytes) }
        }
    }
}

export const startSession = async <C extends Capabilities, S extends Capabilities>(
    orbit: string,
    controller: C,
    sessionKey: S,
    rights: string[] = ['list', 'get'],
    timeMs: number = 1000 * 60,
): Promise<Authenticator> => {
    // delegate to session key
    let exp = new Date(Date.now() + timeMs);
    const delegation = await controller.delegate(
        sessionProps("kepler://" + orbit, sessionKey.id(), rights, exp),
        [],
        randomId(),
        keplerContext
    )

    // return authenticator for client
    return await zcapAuthenticator(sessionKey, delegation);
}

export const sessionProps = (parentCapability: string, invoker: string, capabilityAction: string[] = ['list', 'get'], expiration: Date) => ({
    parentCapability, invoker, capabilityAction, expiration: expiration.toISOString()
})

const invProps = (invocationTarget: string) => ({
    invocationTarget,
})

export const keplerContext = [W3ID_SECURITY_V2, { capabilityAction: { "@id": "sec:capabilityAction", "@type": "@json" } }];
