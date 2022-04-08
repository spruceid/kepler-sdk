import { SiweMessage } from "siwe";
import { base64url } from "rfc4648";
import { Delegation } from "@spruceid/zcap-providers";
import { getHeaderAndDelId } from "./zcap";
import { Authenticator } from "./authenticator";
import { getKRI } from "./util";
import { WalletProvider } from "./walletProvider";
import { SessionOptions } from "./orbit";

const invHeaderStr = "x-siwe-invocation";

export const siweAuthenticator = async <W extends WalletProvider, D>(
  orbit: string,
  client: W,
  domain: string,
  chainId: string = "1",
  delegation?: Delegation<D> | SiweMessage
): Promise<Authenticator> => {
  const pkh = await client.getAddress();
  const { h, delId } = getHeaderAndDelId(delegation);

  return {
    content: async (
      orbit: string,
      service: string,
      path: string,
      fragment: string
    ): Promise<HeadersInit> => {
      const target = getKRI(orbit, service, path, fragment);
      const auth = createSiweAuthContentMessage(
        orbit,
        target,
        pkh,
        domain,
        chainId,
        delId
      );
      const signature = await client.signMessage(auth);
      const invstr = base64url.stringify(
        new TextEncoder().encode(JSON.stringify([auth, signature]))
      );
      return { [invHeaderStr]: invstr, ...h } as {};
    },
    authorizePeer: async (
      orbit: string,
      peer: string
    ): Promise<HeadersInit> => {
      const auth = createSiweAuthCreationMessage(
        orbit,
        pkh,
        peer,
        domain,
        chainId,
        {}
      );
      const signature = await client.signMessage(auth);
      const invstr = base64url.stringify(
        new TextEncoder().encode(JSON.stringify([auth, signature]))
      );
      return { [invHeaderStr]: invstr };
    },
  };
};

const statement = "Authorize an action on your Kepler Orbit";
const version = "1";

const createSiweAuthContentMessage = (
  orbit: string,
  target: string,
  address: string,
  domain: string,
  chainId: string,
  del?: string
) => {
  const now = Date.now();
  return new SiweMessage({
    domain,
    address,
    statement,
    version,
    chainId,
    issuedAt: new Date(now).toISOString(),
    expirationTime: new Date(now + 10000).toISOString(),
    resources: [target],
    uri: del ? `urn:siwe:kepler:{del}` : orbit,
  }).toMessage();
};

const createSiweAuthCreationMessage = (
  orbit: string,
  address: string,
  peer: string,
  domain: string,
  chainId: string,
  opts: SessionOptions = {
    notBefore: new Date(),
    expirationTime: new Date(Date.now() + 120000),
  }
) =>
  new SiweMessage({
    domain,
    address,
    version,
    chainId,
    statement: "Authorize this provider to host your Orbit",
    issuedAt: opts.notBefore?.toISOString() ?? new Date().toISOString(),
    expirationTime:
      opts.expirationTime?.toISOString() ??
      new Date(Date.now() + 120000).toISOString(),
    resources: [`${orbit}#peer`],
    uri: `peer:${peer}`,
  }).toMessage();

const minutesFromNow = (m: number) => new Date(Date.now() + m * 1000 * 60);

export const startSIWESession = async (
  orbit: string,
  domain: string,
  chainId: string,
  delegator: string,
  delegate: string,
  actions: string[] = ["get"],
  opts: SessionOptions = { expirationTime: minutesFromNow(60) }
) =>
  new SiweMessage({
    domain,
    address: delegator,
    statement: `Allow ${domain} to access your orbit using their temporary session key: ${delegate}`,
    uri: delegate,
    resources: actions.map((action) => `${orbit}#${action}`),
    version,
    chainId,
    ...(opts.expirationTime
      ? { expirationTime: opts.expirationTime.toISOString() }
      : {}),
    ...(opts.notBefore ? { notBefore: opts.notBefore.toISOString() } : {}),
  });
