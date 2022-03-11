type Bytes = ArrayLike<number>;

interface WalletProvider {
    getAddress(): Promise<string>;
    getChainId(): Promise<number>;
    signMessage(message: Bytes | string): Promise<string>;
}