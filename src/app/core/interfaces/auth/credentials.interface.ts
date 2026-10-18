export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on(event: 'accountsChanged', listener: (accounts: string[]) => void): void;
  on(event: 'chainChanged', listener: (chainId: string) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
}

export interface EIP6963ProviderDetail {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: EIP1193Provider;
}

export type WalletId = 'metamask' | 'phantom';

export interface AppWallet {
  id: WalletId;
  name: string;
  chain: string;
  icon: string;
  installUrl: string;
}

export interface UserLogin{
    provider:string //wallet provider
    username:string //connectedWallet
}

export interface LoginSignRequest{
  domain:string,
  chainId: number,
  address: string,
  nonce: string,
  issuedAt: string,
  message:string,
  signature:string
}