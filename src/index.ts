export { Kepler, KeplerOptions } from "./kepler";
export { OrbitConnection, Request, Response } from "./orbit";
export { Bytes, WalletProvider } from "./walletProvider";

import { kepler } from "@spruceid/ssx-wasm";
export type HostConfig = kepler.HostConfig;
export type Session = kepler.Session;
export type SessionConfig = kepler.SessionConfig;
