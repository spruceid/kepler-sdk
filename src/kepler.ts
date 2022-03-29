import { makeCidString, siweAuthenticator, startSIWESession, zcapAuthenticator } from ".";
import didkit from '@spruceid/didkit-wasm';
import { didkey, genJWK } from "@spruceid/zcap-providers";
import { ConnectionOptions, OrbitConnection } from "./orbit";
import { makeOrbitId } from "./util";

export type KeplerConfig = { hosts?: string[] };
type DefiniteConfig = { hosts: string[] };

export class Kepler {
    private config: DefiniteConfig;
    constructor(
        private wallet: WalletProvider,
        config: KeplerConfig = {},
    ) {
        this.config = {
            hosts: config.hosts || ["https://kepler.test.spruceid.xyz:443"],
        }
    }

    async orbit(opts: ConnectionOptions = {}): Promise<OrbitConnection> {
        const _didkit = await didkit;

        // TODO: support multiple urls for kepler.
        const keplerUrl = this.config.hosts[0];
        const domain = window.location.hostname;
        const chainId = await this.wallet.getChainId().then(id => id.toString());
        const addr = await this.wallet.getAddress();
        const oid = opts.orbit || makeOrbitId(`pkh:eip155:${chainId}:${addr}`, "default");
        const actions = opts.actions || ['put', 'get', 'list', 'del', 'metadata'];
        const sessionOpts = opts.sessionOpts || { exp: new Date(Date.now() + 1000*60*60) };

        const sessionKey = await didkey(genJWK(_didkit), _didkit);
        const sessionSiweMessage = await startSIWESession(oid + '/s3', domain, chainId, addr, sessionKey.id(), actions, sessionOpts);
        sessionSiweMessage.signature = await this.wallet.signMessage(sessionSiweMessage.signMessage());

        const orbitConn = await zcapAuthenticator(sessionKey, sessionSiweMessage).then(authn => new OrbitConnection(keplerUrl, oid, authn));

        await orbitConn.list().then(async ({ status }) => {
            if (status === 404) {
                console.info("Orbit does not already exist. Creating...")
                const siweAuthn = await siweAuthenticator(oid, this.wallet, domain, chainId);
                const headers = await fetch(keplerUrl + '/peer/generate')
                    .then(res => res.text())
                    .then(peerId => siweAuthn.authorizePeer(oid, peerId));
                const oidCid = await makeCidString(oid);
                await fetch(keplerUrl + "/" + oidCid, {
                    method: 'POST',
                    headers,
                    body: oid
                })
            }
        })

        return orbitConn;
    };
}