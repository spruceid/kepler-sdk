import { Authenticator, Action, getOrbitId, orbitParams } from '.';
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
        createOrbit: async (cids: string[]): Promise<HeadersInit> => {
            // TODO need orbit id here
            const props = invProps("orbit_id", { create: cids });
            const inv = await client.invoke(props, "kepler://orbit_id", randomId(), keplerContext);
            const invBytes = new TextEncoder().encode(JSON.stringify(inv));
            return { "X-Kepler-Invocation": base64url.stringify(invBytes) }
        }
    }
}

enum ContentActionKeys {
    get = 'get',
    put = 'put',
    del = 'del'
}

type CapContentAction = { [K in ContentActionKeys]?: string[] }
type CapOrbitAction = 'list' | { create: string[] }

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

const keplerContext = [W3ID_SECURITY_V2, { capabilityAction: { "@id": "sec:capabilityAction", "@type": "@json" } }];
