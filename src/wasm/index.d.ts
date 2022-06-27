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



/**
 * Configuration object for starting a Kepler session.
 */
export type SessionConfig = {
  /** Actions that the session key will be permitted to perform. */
  actions: string[],
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
  /** The service that the session key will be permitted to perform actions against. */
  service: string,
}



/**
 * A Kepler session.
 */
export type Session = {
  /** The delegation from the user to the session key. */
  delegation: object,
  /** The session key. */
  jwk: object,
  /** The orbit that the session key is permitted to perform actions against. */
  orbitId: string,
  /** The service that the session key is permitted to perform actions against. */
  service: string,
  /** The verification method of the session key. */
  verificationMethod: string,
}



export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly didkit_error_message: () => number;
  readonly didkit_error_code: () => number;
  readonly makeOrbitId: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly prepareSession: (a: number, b: number) => number;
  readonly completeSessionSetup: (a: number, b: number, c: number) => void;
  readonly invoke: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly generateHostSIWEMessage: (a: number, b: number, c: number) => void;
  readonly host: (a: number, b: number, c: number) => void;
  readonly SHA1DCFinal: (a: number, b: number) => number;
  readonly sha1_compression_states: (a: number, b: number, c: number, d: number) => void;
  readonly ubc_check: (a: number, b: number) => void;
  readonly SHA1DCInit: (a: number) => void;
  readonly SHA1DCSetSafeHash: (a: number, b: number) => void;
  readonly SHA1DCSetUseUBC: (a: number, b: number) => void;
  readonly SHA1DCSetUseDetectColl: (a: number, b: number) => void;
  readonly SHA1DCSetDetectReducedRoundCollision: (a: number, b: number) => void;
  readonly SHA1DCSetCallback: (a: number, b: number) => void;
  readonly SHA1DCUpdate: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h0d15dd0163a89891: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h02fe969503481f69: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* Synchronously compiles the given `bytes` and instantiates the WebAssembly module.
*
* @param {BufferSource} bytes
*
* @returns {InitOutput}
*/
export function initSync(bytes: BufferSource): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
