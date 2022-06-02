import wasmPromise from "@spruceid/kepler-sdk-wasm";
import { SessionConfig, Session } from ".";
import { WalletProvider } from "./walletProvider";

export async function startSession(
  wallet: WalletProvider,
  config?: Partial<SessionConfig>
): Promise<Session> {
  let wasm = await wasmPromise;
  let address = config?.address ?? (await wallet.getAddress());
  let chainId = config?.chainId ?? (await wallet.getChainId());
  return Promise.resolve({
    address,
    chainId,
    domain: config?.domain ?? window.location.hostname,
    service: config?.service ?? "kv",
    issuedAt: config?.issuedAt ?? new Date(Date.now()).toISOString(),
    notBefore: config?.notBefore,
    expirationTime:
      config?.expirationTime ??
      new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    actions: config?.actions ?? ["put", "get", "list", "del", "metadata"],
    orbitId: config?.orbitId ?? wasm.makeOrbitId(address, chainId),
  })
    .then(JSON.stringify)
    .then(wasm.prepareSession)
    .then(JSON.parse)
    .then(async (preparedSession) => ({
      ...preparedSession,
      signature: await wallet.signMessage(preparedSession.siwe),
    }))
    .then(JSON.stringify)
    .then(wasm.completeSessionSetup)
    .then(JSON.parse);
}

export class Authenticator {
  private orbitId: string;
  private serializedSession: string;
  constructor(session: Session) {
    this.orbitId = session.orbitId;
    this.serializedSession = JSON.stringify(session);
  }

  invocationHeaders = async (
    action: string,
    path: string
  ): Promise<HeadersInit> =>
    (await wasmPromise)
      .invoke(this.serializedSession, path, action)
      .then(JSON.parse);
  getOrbitId = (): string => this.orbitId;
}
