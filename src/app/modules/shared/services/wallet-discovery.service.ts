import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { WINDOW } from 'src/app/core/constants/window';
import { AppWallet, EIP6963ProviderDetail, UserLogin } from 'src/app/core/interfaces/auth/credentials.interface';
import Web3 from 'web3';


@Injectable({
  providedIn: 'root'
})
export class WalletDiscoveryService {

  private readonly _window = inject(WINDOW);
  private readonly _providers = signal<EIP6963ProviderDetail[]>([]);
  
  readonly providers = this._providers.asReadonly();
  readonly metamask = computed(() => this._providers().find(p => p.info.rdns === 'io.metamask') ?? null);

  public readonly wallets: AppWallet[] = [
    { id: 'metamask', name: 'MetaMask', chain: 'Ethereum', icon: 'assets/images/MetamaskIconBrown.png', installUrl: 'https://metamask.io/download/' },
    // #TODO{ id: 'phantom', name: 'Phantom', chain: 'Solana', icon: 'assets/images/phantom.svg', installUrl: 'https://phantom.com/' },
  ];
  constructor() { 
    if(!this._window) return;
    const onProviderAnnounce = (event: Event) => {
      const { detail } = event as CustomEvent<EIP6963ProviderDetail>;
      this._providers.update(list => list.some(p => p.info.uuid === detail.info.uuid) ? list : [...list, detail]);
    }
    this._window.addEventListener('eip6963:announceProvider', onProviderAnnounce);
    this._window.dispatchEvent(new Event('eip6963:requestProvider'));
    inject(DestroyRef).onDestroy(() => this._window?.removeEventListener('eip6963:announceProvider', onProviderAnnounce));
  }

  public getProvider(name: string) : EIP6963ProviderDetail | null{
    // this will trigger the AuthService.ProviderEvents effect
    const provider = this._providers().find(p => p.info.name === name);
    return provider ? provider : null
  }
}
