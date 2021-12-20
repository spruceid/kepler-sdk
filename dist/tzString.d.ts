import { DAppClient } from '@airgap/beacon-sdk';
import { Authenticator } from '.';
export declare const tzStringAuthenticator: <D extends DAppClient>(client: D, domain: string) => Promise<Authenticator>;
export declare const stringEncoder: (s: string) => string;
