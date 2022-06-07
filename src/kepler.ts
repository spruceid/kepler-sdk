import { SessionConfig } from ".";
import { Authenticator, startSession } from "./authenticator";
import { hostOrbit, OrbitConnection } from "./orbit";
import { WalletProvider } from "./walletProvider";

/** Configuration for [[Kepler]]. */
export type KeplerOptions = {
  /** The Kepler hosts that you wish to connect to.
   *
   * Currently only a single host is supported, but for future compatibility this property is
   * expected to be a list. Only the first host in the list will be used.
   */
  hosts: string[];
};

/** An object for interacting with Kepler instances. */
export class Kepler {
  private config: KeplerOptions;
  private wallet: WalletProvider;

  /**
   * @param wallet The controller of the orbit that you wish to access.
   * @param config Optional configuration for Kepler.
   */
  constructor(wallet: WalletProvider, config: KeplerOptions) {
    this.config = {
      hosts: config.hosts,
    };
    this.wallet = wallet;
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
    config: Partial<SessionConfig> = {}
  ): Promise<OrbitConnection | undefined> {
    // TODO: support multiple urls for kepler.
    const keplerUrl = this.config.hosts[0];
    let orbitConnection: OrbitConnection = await startSession(
      this.wallet,
      config
    )
      .then((session) => new Authenticator(session))
      .then((authn) => new OrbitConnection(keplerUrl, authn));

    return await orbitConnection.list().then(async ({ status }) => {
      if (status === 404) {
        console.info("Orbit does not already exist. Creating...");
        let { ok } = await hostOrbit(
          this.wallet,
          keplerUrl,
          orbitConnection.id(),
          config.domain
        );
        return ok ? orbitConnection : undefined;
      }
      return orbitConnection;
    });
  }
}

export const invoke = (
  url: string,
  params: { headers: HeadersInit; body?: Blob }
) => fetch(url + "/invoke", { method: "POST", ...params });
