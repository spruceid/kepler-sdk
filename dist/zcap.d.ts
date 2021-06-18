import { AuthFactory } from ".";
import Web3 from 'web3';
declare type Preperation = any;
export declare const ethAuthenticator: AuthFactory<Web3>;
export declare const prepareInvocation: (target_id: string, invProps: any, sigOpts: any, pk: any) => Promise<Preperation>;
export declare const completeInvocation: (invProps: any, preperation: Preperation, signature: string) => Promise<any>;
export {};
