/* tslint:disable */
/* eslint-disable */
/**
* @param {string} address
* @param {number} chainId
* @param {string | undefined} name
* @returns {string}
*/
export function makeOrbitId(address: string, chainId: number, name?: string): string;
/**
* @param {string} config
* @returns {Promise<any>}
*/
export function prepareSession(config: string): Promise<any>;
/**
* @param {string} config
* @returns {string}
*/
export function completeSessionSetup(config: string): string;
/**
* @param {string} session
* @param {string} path
* @param {string} action
* @returns {Promise<any>}
*/
export function invoke(session: string, path: string, action: string): Promise<any>;
/**
* @param {string} config
* @returns {string}
*/
export function generateHostSIWEMessage(config: string): string;
/**
* @param {string} signedSIWEMessage
* @returns {string}
*/
export function host(signedSIWEMessage: string): string;

export type HostConfig = {
  address: string,
  chainId: number,
  domain: string,
  issuedAt: string,
  orbitId: string,
  peerId: string,
}



export type SessionConfig = {
  actions: string[],
  address: string,
  chainId: number,
  domain: string,
  issuedAt: string,
  orbitId: string,
  notBefore?: string,
  expirationTime: string,
  service: string,
}


