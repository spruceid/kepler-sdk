import { Action } from "."

export enum ContentActionKeys {
    get = 'get',
    put = 'put',
    del = 'del'
}

export type CapContentAction = { [K in ContentActionKeys]?: string[] }
export type CapOrbitAction = 'list' | { create: string[] }

export const actionToKey = (action: Action, cids: string[]): CapContentAction | 'list' => {
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

export const invProps = (orbit: string, capabilityAction: CapContentAction | CapOrbitAction = 'list') => ({
    "@context": ["https://w3id.org/security/v2", { capabilityAction: { "@id": "sec:capabilityAction", "@type": "@json" } }],
    // TODO unique
    id: "urn:uuid:helo",
    invocationTarget: orbit,
    capabilityAction
})
