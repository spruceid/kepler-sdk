import wasmPromise from "@spruceid/kepler-sdk-wasm";
import { SessionConfig, Session } from ".";
import { WalletProvider } from "./walletProvider";

export async function startSession(
  wallet: WalletProvider,
  config?: Partial<SessionConfig>
): Promise<Session> {
  const wasm = await wasmPromise;
  const address = config?.address ?? (await wallet.getAddress());
  const chainId = config?.chainId ?? (await wallet.getChainId());
  const domain = config?.domain ?? window.location.hostname;
  return Promise.resolve({
    address,
    chainId,
    domain,
    service: config?.service ?? "kv",
    issuedAt: config?.issuedAt ?? new Date(Date.now()).toISOString(),
    notBefore: config?.notBefore,
    expirationTime:
      config?.expirationTime ??
      new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    actions: config?.actions ?? {
      "": ["put", "get", "list", "del", "metadata"],
    },
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

export async function activateSession(
  session: Session,
  url: string
): Promise<Authenticator> {
  let res = await fetch(url + "/delegate", {
    method: "POST",
    headers: session.delegationHeader,
  });

  if (res.status === 200) {
    return new Authenticator(session);
  } else {
    throw {
      status: res.status,
      msg: "Failed to delegate to session key",
    };
  }
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
