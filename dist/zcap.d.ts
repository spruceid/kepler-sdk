import { Authenticator } from '.';
import { Capabilities, Delegation } from '@spruceid/zcap-providers';
import { SiweMessage } from 'siwe';
export declare const getHeaderAndDelId: <D>(delegation?: Delegation<D> | SiweMessage | undefined) => {
    h: {
        "X-Siwe-Delegation": string;
        "X-Kepler-Delegation"?: undefined;
    };
    delId: string;
} | {
    h: {
        "X-Kepler-Delegation": string;
        "X-Siwe-Delegation"?: undefined;
    };
    delId: string;
} | {
    h: {
        "X-Siwe-Delegation"?: undefined;
        "X-Kepler-Delegation"?: undefined;
    };
    delId: string;
};
export declare const zcapAuthenticator: <C extends Capabilities, D>(client: C, delegation?: SiweMessage | Delegation<D> | undefined) => Promise<Authenticator>;
export declare const startSession: <C extends Capabilities, S extends Capabilities>(orbit: string, controller: C, sessionKey: S, rights?: string[], timeMs?: number) => Promise<Authenticator>;
export declare const didVmToParams: (didVm: string, other?: {
    [key: string]: string | number;
}) => string;
export declare const sessionProps: (parentCapability: string, invoker: string, capabilityAction: string[] | undefined, expiration: Date) => {
    parentCapability: string;
    invoker: string;
    capabilityAction: string[];
    expiration: string;
};
export declare const keplerContext: (string | {
    capabilityAction: {
        "@id": string;
        "@type": string;
    };
})[];
