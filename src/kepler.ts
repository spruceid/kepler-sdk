import didkit from "@spruceid/didkit-wasm";
import { didkey, genJWK } from "@spruceid/zcap-providers";
import { ConnectionOptions, OrbitConnection, SessionOptions } from "./orbit";
import { siweAuthenticator, startSIWESession } from "./siwe";
import { makeCidString, makeOrbitId } from "./util";
import { WalletProvider } from "./walletProvider";
import { zcapAuthenticator } from "./zcap";

if (typeof fetch === "undefined") {
  const fetch = require("node-fetch");
}

/** Configuration for {@link Kepler}. */
export type KeplerOptions = {
  /** The Kepler hosts that you wish to connect to.
   *
   * This defaults to Spruce's Kepler instance.
   *
   * Currently only a single host is supported, but for future compatibility this property is
   * expected to be a list. Only the first host in the list will be used.
   */
  hosts?: string[];
};

/** An object for interacting with Kepler instances. */
export class Kepler {
  private config: Required<KeplerOptions>;
  private wallet: WalletProvider;

  /**
   * @param wallet The controller of the orbit that you wish to access.
   * @param config Optional configuration for Kepler.
   */
  constructor(wallet: WalletProvider, config: KeplerOptions = {}) {
    this.config = {
      hosts: config.hosts || ["https://kepler.test.spruceid.xyz:443"],
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
   * @param opts Optional parameters to configure the orbit connection.
   */
  async orbit(opts: ConnectionOptions = {}): Promise<OrbitConnection> {
    const _didkit = await didkit;

    // TODO: support multiple urls for kepler.
    const keplerUrl = this.config.hosts[0];
    const domain = window.location.hostname;
    const chainId = await this.wallet.getChainId().then((id) => id.toString());
    const addr = await this.wallet.getAddress();
    const oid =
      opts.orbit || makeOrbitId(`pkh:eip155:${chainId}:${addr}`, "default");
    const actions = opts.actions || ["put", "get", "list", "del", "metadata"];
    const sessionOpts: SessionOptions = {};
    sessionOpts.expirationTime =
      opts.sessionOpts?.expirationTime || new Date(Date.now() + 1000 * 60 * 60);
    sessionOpts.notBefore = opts.sessionOpts?.notBefore;

    const sessionKey = await didkey(genJWK(_didkit), _didkit);
    const sessionSiweMessage = await startSIWESession(
      oid + "/s3",
      domain,
      chainId,
      addr,
      sessionKey.id(),
      actions,
      sessionOpts
    );
    sessionSiweMessage.signature = await this.wallet.signMessage(
      sessionSiweMessage.signMessage()
    );

    const orbitConn = await zcapAuthenticator(
      sessionKey,
      sessionSiweMessage
    ).then((authn) => new OrbitConnection(keplerUrl, oid, authn));

    await orbitConn.list().then(async ({ status }) => {
      if (status === 404) {
        console.info("Orbit does not already exist. Creating...");
        const siweAuthn = await siweAuthenticator(
          oid,
          this.wallet,
          domain,
          chainId
        );
        await fetch(keplerUrl + "/peer/generate")
          // @ts-ignore
          .then((res) => res.text())
          // @ts-ignore
          .then((peerId) => siweAuthn.authorizePeer(oid, peerId))
          .then((headers) => invoke(keplerUrl, { headers }));
      }
    });

    return orbitConn;
  }
}

export const invoke = (
  url: string,
  params: { headers: HeadersInit; body?: Blob }
) => fetch(url + "/invoke", { method: "POST", ...params });
