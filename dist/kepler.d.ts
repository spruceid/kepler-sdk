import { SessionConfig } from ".";
import { OrbitConnection } from "./orbit";
import { WalletProvider } from "./walletProvider";
/** Configuration for [[Kepler]]. */
export declare type KeplerOptions = {
    /** The Kepler hosts that you wish to connect to.
     *
     * Currently only a single host is supported, but for future compatibility this property is
     * expected to be a list. Only the first host in the list will be used.
     */
    hosts: string[];
};
/** An object for interacting with Kepler instances. */
export declare class Kepler {
    private config;
    private wallet;
    /**
     * @param wallet The controller of the orbit that you wish to access.
     * @param config Optional configuration for Kepler.
     */
    constructor(wallet: WalletProvider, config: KeplerOptions);
    /** Make a connection to an orbit.
     *
     * This method handles the creation and connection to an orbit in Kepler. This method should
     * usually be used without providing any ConnectionOptions:
     * ```ts
     * let orbitConnection = await kepler.orbit();
     * ```
     * In this case the orbit ID will be derived from the wallet's address. The wallet will be
     * asked to sign a message delegating access to a session key for 1 hour. If the orbit does not
     * already exist in the Kepler instance, then the wallet will be asked to sign another message
     * to permit the Kepler instance to host the orbit.
     *
     * @param config Optional parameters to configure the orbit connection.
     * @returns Returns undefined if the Kepler instance was unable to host the orbit.
     */
    orbit(config?: Partial<SessionConfig>): Promise<OrbitConnection | undefined>;
}
export declare const invoke: (url: string, params: {
    headers: HeadersInit;
    body?: Blob;
}) => Promise<Response>;
