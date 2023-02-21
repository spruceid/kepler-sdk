export {
  KeplerOptions,
  OrbitConnection,
  Request,
  Response,
  Bytes,
  WalletProvider,
  HostConfig,
  Session,
  SessionConfig,
  activateSession,
  hostOrbit,
} from "kepler-sdk-wasm-wrapper";
import {
  Kepler as Kepler_,
  WalletProvider,
  KeplerOptions,
  OrbitConnection,
  SessionConfig,
} from "kepler-sdk-wasm-wrapper";
import wasmPromise from "kepler-sdk-wasm";

export class Kepler extends Kepler_ {
  /**
   * Initialise a Kepler instance.
   *
   * @param wallet The controller of the orbit that you wish to access.
   * @param config Optional configuration for Kepler.
   */
  constructor(wallet: WalletProvider, config: KeplerOptions) {
    super(wallet, config);
  }

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
  async orbit(
    config?: Partial<SessionConfig>
  ): Promise<OrbitConnection | undefined> {
    (global as any).keplerModule = await wasmPromise;
    return super.orbit(config);
  }
}
