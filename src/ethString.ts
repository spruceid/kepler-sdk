import { Authenticator, Action, getOrbitId, orbitParams } from '.';

const createEthAuthContentMessage = (orbit: string, pkh: string, action: Action, cids: string[], domain: string): string =>
    `${domain} ${(new Date()).toISOString()} ${pkh} ${orbit} ${action} ${cids.join(' ')}`

const createEthAuthCreationMessage = async (pkh: string, cids: string[], params: { domain: string; salt?: string; index?: number; }): Promise<string> =>
    `${params.domain} ${(new Date()).toISOString()} ${pkh} ${await getOrbitId("eth", { address: pkh, ...params })} CREATE eth${orbitParams(params)} ${cids.join(' ')}`
