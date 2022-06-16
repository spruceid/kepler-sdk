import { SessionConfig, Session } from ".";
import { WalletProvider } from "./walletProvider";
export declare function startSession(wallet: WalletProvider, config?: Partial<SessionConfig>): Promise<Session>;
export declare class Authenticator {
    private orbitId;
    private serializedSession;
    constructor(session: Session);
    invocationHeaders: (action: string, path: string) => Promise<HeadersInit>;
    getOrbitId: () => string;
    serialise: () => string;
    static deserialise(serializedAuthenticator: string): Authenticator;
}
