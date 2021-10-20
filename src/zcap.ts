import { Authenticator, Action, makeCid, orbitParams } from '.';
import { base64url } from 'rfc4648';
import { Capabilities, W3ID_SECURITY_V2, randomId, Delegation } from '@spruceid/zcap-providers';

export const zcapAuthenticator = async <C extends Capabilities, D>(client: C, delegation?: Delegation<D>): Promise<Authenticator> => {
    const delb64 = delegation ? base64url.stringify(new TextEncoder().encode(JSON.stringify(delegation))) : undefined;
    return {
        content: async (orbit: string, cids: string[], action: Action): Promise<HeadersInit> => {
            const props = invProps(orbit, actionToKey(action, cids));
            const inv = await client.invoke(props, delegation ? delegation.id : "kepler://" + orbit, randomId(), keplerContext);
            const invstr = base64url.stringify(new TextEncoder().encode(JSON.stringify(inv)));
            return delb64 ? {
                "X-Kepler-Invocation": invstr,
                "X-Kepler-Delegation": delb64
            } : {
                "X-Kepler-Invocation": invstr,
            }
        },
        createOrbit: async (cids: string[], params: { [key: string]: number | string } = {}, method: string = 'did'): Promise<HeadersInit> => {
            const parameters = method === 'did' ? didVmToParams(client.id(), params) : orbitParams(params);
            const oid = await makeCid(parameters, 'raw');
            const props = invProps(oid, {
                create: {
                    parameters, content: cids
                }
            });
            const inv = await client.invoke(props, "kepler://" + oid, randomId(), keplerContext);
            const invBytes = new TextEncoder().encode(JSON.stringify(inv));
            return { "X-Kepler-Invocation": base64url.stringify(invBytes) }
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

export const didVmToParams = (didVm: string, other: { [key: string]: string | number } = {}) => {
    const [did, vm] = didVm.split("#");
    return "did" + orbitParams({ ...other, did, vm })
}


export const sessionProps = (parentCapability: string, invoker: string, capabilityAction: string[] = ['list', 'get'], expiration: Date) => ({
    parentCapability, invoker, capabilityAction, expiration: expiration.toISOString()
})

enum ContentActionKeys {
    get = 'get',
    put = 'put',
    del = 'del'
}

type CapContentAction = { [K in ContentActionKeys]?: string[] }
type CapOrbitAction = 'list' | { create: { parameters: string, content: string[] } }

const actionToKey = (action: Action, cids: string[]): CapContentAction | 'list' => {
    switch (action) {
        case Action.get:
            return { [ContentActionKeys.get]: cids }
        case Action.put:
            return { [ContentActionKeys.put]: cids }
        case Action.delete:
            return { [ContentActionKeys.del]: cids }
        case Action.list:
            return 'list'
    }
}

const invProps = (orbit: string, capabilityAction: CapContentAction | CapOrbitAction = 'list') => ({
    invocationTarget: orbit,
    capabilityAction
})

export const keplerContext = [W3ID_SECURITY_V2, { capabilityAction: { "@id": "sec:capabilityAction", "@type": "@json" } }];
