import wasmPromise, { HostConfig } from "@spruceid/kepler-sdk-wasm";
import { SessionConfig } from ".";
import { Authenticator, startSession } from "./authenticator";
import { FetchResponse, OrbitConnection, Response } from "./orbit";
import { WalletProvider } from "./walletProvider";

const fetch_ = typeof fetch === "undefined" ? require("node-fetch") : fetch;

/** Configuration for [[Kepler]]. */
export type KeplerOptions = {
  /** The Kepler host that you wish to connect to. */
  host: string;
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
    this.config = config;
    this.wallet = wallet;
  }

  /** Make a connection to an orbit.
   *
   * This method handles the connection to an orbit in Kepler. This method should
   * usually be used without providing any SessionConfig:
   * ```ts
   * let orbitConnection = await kepler.orbit();
   * ```
   * In this case the orbit ID will be derived from the wallet's address.
   *
   * The wallet will be asked to sign a message delegating access to a session key for 1 hour.
   *
   * @param config Optional parameters to configure the orbit connection.
   */
  connect = (config: Partial<SessionConfig> = {}): Promise<OrbitConnection> =>
    startSession(this.wallet, config)
      .then((session) => new Authenticator(session))
      .then((authn) => new OrbitConnection(this.config.host, authn));

  async hostOrbit(config?: Partial<HostConfig>): Promise<Response> {
    const wasm = await wasmPromise;

    const address = config?.address ?? (await this.wallet.getAddress());
    const chainId = config?.chainId ?? (await this.wallet.getChainId());
    const config_: HostConfig = {
      address,
      chainId,
      domain: config?.domain ?? window.location.hostname,
      issuedAt: config?.issuedAt ?? new Date(Date.now()).toISOString(),
      orbitId: config?.orbitId ?? wasm.makeOrbitId(address, chainId),
      peerId:
        config?.peerId ??
        (await fetch_(this.config.host + "/peer/generate").then(
          (res: FetchResponse) => res.text()
        )),
    };

    const siwe = wasm.generateHostSIWEMessage(JSON.stringify(config_));
    const signature = await this.wallet.signMessage(siwe);
    const hostHeaders = wasm.host(JSON.stringify({ siwe, signature }));

    return fetch_(this.config.host + "/delegate", {
      method: "POST",
      headers: JSON.parse(hostHeaders),
    }).then(({ ok, status, statusText, headers }: FetchResponse) => ({
      ok,
      status,
      statusText,
      headers,
    }));
  }
}

export const invoke = (
  url: string,
  params: { headers: HeadersInit; body?: Blob }
) => fetch_(url + "/invoke", { method: "POST", ...params });
