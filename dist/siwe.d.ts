import { SiweMessage } from 'siwe';
import { Signer } from 'ethers';
import { Authenticator } from '.';
import { Delegation } from '@spruceid/zcap-providers';
export declare const siweAuthenticator: <S extends Signer, D>(client: S, domain: string, chainId?: string, delegation?: SiweMessage | Delegation<D> | undefined) => Promise<Authenticator>;
declare type SessionOptions = {
    nbf?: Date;
    exp?: Date;
};
export declare const startSIWESession: (orbit: string, domain: string, chainId: string, delegator: string, delegate: string, actions?: string[], opts?: SessionOptions) => Promise<SiweMessage>;
export {};
