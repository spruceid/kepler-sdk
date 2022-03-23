

export const makeKRI = (suffix: string, name: string, app?: string, path?: string, fragment?: string) =>
    `kepler:${suffix}://${name}${app ? '/' + app : ''}${path ? '/' + path : ''}${fragment ? '#' + fragment : ''}`

export const makeOrbitId = (suffix: string, name: string) => `kepler:${suffix}://${name}`

export const getKRI = (orbit: string, app: string, path: string, fragment?: string) => `${orbit}/${app}/${path}${fragment ? '#' + fragment : ''}`

export const didToOrbitId = (did: string, name: string) => did.startsWith('did:') ? makeOrbitId(did.slice(4), name) : makeOrbitId(did, name)
