import { AuthFactory } from ".";
declare type Preperation = any;
export declare const ethAuthenticator: AuthFactory<any>;
export declare const prepareInvocation: (target_id: string, invProps: any, sigOpts: any, pk: any) => Promise<Preperation>;
export declare const completeInvocation: (invProps: any, preperation: Preperation, signature: string) => Promise<any>;
export {};
