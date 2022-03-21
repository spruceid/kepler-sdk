import { siweAuthenticator, startSIWESession, zcapAuthenticator } from ".";
import didkit from '@spruceid/didkit-wasm';
import { didkey, genJWK } from "@spruceid/zcap-providers";
import { Orbit } from "./orbit";
import { makeOrbitId } from "./util";

const defaultActions: string[] = ['put', 'get', 'list', 'del'];
const oneHourInMs = 1000 * 60 * 60;
const defaultSessionOpts: SessionOptions = { exp: new Date(Date.now() + oneHourInMs) };

type SessionOptions = {
    nbf?: Date,
    exp?: Date
};

export class Kepler {
    constructor(
        private wallet: WalletProvider,
        private keplerUrls: string[] = ["https://kepler.test.spruceid.xyz:443"],
    ) {}

    async orbit(): Promise<Orbit> {
        const _didkit = await didkit;

        // TODO: support multiple urls for kepler.
        const keplerUrl = this.keplerUrls[0];
        const domain = window.location.hostname;
        const chainId = await this.wallet.getChainId().then(id => id.toString());
        const addr = await this.wallet.getAddress();
        const oid = makeOrbitId(`pkh:eip155:${chainId}:${addr}`, "default");

        const siweAuthn = await siweAuthenticator(oid, this.wallet, domain, chainId);
        let headers = await fetch(keplerUrl + '/peer/generate')
          .then(res => res.text())
          .then(peerId => siweAuthn.authorizePeer(oid, peerId));
        await fetch(keplerUrl + "/" + oid, {
            method: 'POST',
            headers
        }).catch(console.warn);

        const sessionKey = await didkey(genJWK(_didkit), _didkit);

        const sessionSiweMessage = await startSIWESession(oid, domain, chainId, addr, sessionKey.id(), defaultActions, defaultSessionOpts);
        sessionSiweMessage.signature = await this.wallet.signMessage(sessionSiweMessage.signMessage());

        return zcapAuthenticator(sessionKey, sessionSiweMessage).then(authn => new Orbit(keplerUrl, oid, authn));
    };
}