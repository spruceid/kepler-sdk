/* tslint:disable */
/* eslint-disable */
/**
* Initialise console-error-panic-hook to improve debug output for panics.
*
* Run once on initialisation.
*/
export function initPanicHook(): void;
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
* @param {string} service
* @param {string} path
* @param {string} action
* @returns {Promise<any>}
*/
export function invoke(session: string, service: string, path: string, action: string): Promise<any>;
/**
* @param {string} config
* @returns {string}
*/
export function generateHostSIWEMessage(config: string): string;
/**
* @param {string} signedSIWEMessage
* @returns {string}
*/
export function siweToDelegationHeaders(signedSIWEMessage: string): string;

/**
 * Configuration object for starting a Kepler session.
 */
export type SessionConfig = {
  /** Actions that the session key will be permitted to perform, organized by service and path */
  actions: { [service: string]: { [key: string]: string[] }},
  /** Ethereum address. */
  address: string,
  /** Chain ID. */
  chainId: number,
  /** Domain of the webpage. */
  domain: string,
  /** Current time for SIWE message. */
  issuedAt: string,
  /** The orbit that is the target resource of the delegation. */
  orbitId: string,
  /** The earliest time that the session will be valid from. */
  notBefore?: string,
  /** The latest time that the session will be valid until. */
  expirationTime: string,
  /** Optional parent delegations to inherit and attenuate */
  parents?: string[]
  /** Optional jwk to delegate to */
  jwk?: object
}



/**
 * A Kepler session.
 */
export type Session = {
  /** The delegation from the user to the session key. */
  delegationHeader: { Authorization: string },
  /** The delegation reference from the user to the session key. */
  delegationCid: string,
  /** The session key. */
  jwk: object,
  /** The orbit that the session key is permitted to perform actions against. */
  orbitId: string,
  /** The verification method of the session key. */
  verificationMethod: string,
}



/**
 * Configuration object for generating a Orbit Host Delegation SIWE message.
 */
export type HostConfig = {
  /** Ethereum address. */
  address: string,
  /** Chain ID. */
  chainId: number,
  /** Domain of the webpage. */
  domain: string,
  /** Current time for SIWE message. */
  issuedAt: string,
  /** The orbit that is the target resource of the delegation. */
  orbitId: string,
  /** The peer that is the target/invoker in the delegation. */
  peerId: string,
}


