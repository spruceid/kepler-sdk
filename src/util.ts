

const makeKRI = (suffix: string, name: string, app?: string, path?: string, fragment?: string) =>
    `kepler:${suffix}://${name}${app ? ':' + app : ''}${path ? '/' + path : ''}${fragment ? '#' + fragment : ''}`

const makeOrbitId = (suffix: string, name: string) => `kepler:${suffix}://${name}`

const getKRI = (orbit: string, app: string, path: string, fragment?: string) => `${orbit}:${app}/${path}${fragment ? '#' + fragment : ''}`
