import wasmPromise from "@spruceid/kepler-sdk-wasm";
import { SessionConfig, Session } from ".";
import { WalletProvider } from "./walletProvider";
import { hostOrbit } from './orbit';

export async function startSession(
  wallet: WalletProvider,
  endpoint: string,
  config?: Partial<SessionConfig>,
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
    actions: config?.actions ?? ["put", "get", "list", "del", "metadata"],
    orbitId: config?.orbitId ?? wasm.makeOrbitId(address, chainId)
  })
    .then(JSON.stringify)
    .then(wasm.prepareSession)
    .then(JSON.parse)
    .then(async (preparedSession) =>
    ({
      ...preparedSession,
      signature: await wallet.signMessage(preparedSession.siwe),
    }))
    .then(async ({ siwe, signature, jwk, orbitId, service, verificationMethod }) =>
    ({
      jwk,
      orbitId,
      service,
      verificationMethod,
      delegation: await fetch(endpoint + '/delegate', {
        headers: JSON.parse(wasm.siweMessageHeaders(JSON.stringify({ siwe, signature }))),
        method: 'POST'
      }).then(async (res) => {
        const rt = await res.text()
        if (res.ok) {
          return rt
        } else if (res.status === 404) {
          const { ok, statusText } = await hostOrbit(wallet, endpoint, orbitId, domain);
          if (ok) {
            return await fetch(endpoint + '/delegate', {
              headers: JSON.parse(wasm.siweMessageHeaders(JSON.stringify({ siwe, signature }))),
              method: 'POST'
            }).then(async (ires) => {
              const t = await ires.text();
              if (ires.ok) {
                return t
              } else {
                throw new Error("Failed to open session: " + t)
              }
            })
          } else {
            throw new Error("Failed to open Orbit: " + statusText)
          }
        } else {
          throw new Error("Failed to open session: " + rt)
        }
      })
    } as Session))
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
