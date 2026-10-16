import { DestroyRef, inject, Injectable, NgZone, signal } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WINDOW } from '../../constants/window';
import { EIP1193Provider, UserLogin } from '../../interfaces/auth/credentials.interface';
import { WalletDiscoveryService } from 'src/app/modules/shared/services/wallet-discovery.service';
import Web3 from 'web3';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { 
    const loggedUser = this.userLogin();
    if(loggedUser){
      const providerDetail = this.walletDiscovery.getProvider(loggedUser.provider);
      if(providerDetail)
        this.watch(providerDetail.provider);
    }

  }

  public onAccountChange: Subject<string> = new Subject<string>(); 
  public userLogin = signal<UserLogin | null>(this._readStoredLogin());
  private readonly _window = inject(WINDOW);
  private readonly walletDiscovery = inject(WalletDiscoveryService);
  private _router: Router = inject(Router);
  private _zone: NgZone = inject(NgZone);
  private _destroyRef: DestroyRef = inject(DestroyRef);
  private authUrl:string = ''

  private watched: EIP1193Provider | null = null;

  // Función flecha guardada en una propiedad: siempre es la MISMA referencia
  // (removeListener la necesita) y el `this` apunta al servicio.
  private readonly onAccountsChanged = (accounts: string[]) => {
    this._zone.run(() => {
      const current = this.userLogin();
      if(!current || !accounts.length){
        void this._router.navigateByUrl('/auth/login');
        return;
      }

      if (accounts[0].toLowerCase() === current.username.toLowerCase()) return;

      current.username = accounts[0];
      this.userLogin.set(current);
      localStorage.setItem('user-login', JSON.stringify(current));
      let data: GameData ={
        username: current.username,
        gameType:'',
        gameStatus: "READY",
        charname:'',
        selectedCharacter:undefined,
        character:undefined,
        isRandomCharacter:false,
        gameSessionId:'',
        userPreferences:undefined,
        intro:"",
        currentBlock:0,
        isLocked: false
      };
      localStorage.setItem('game-data', JSON.stringify(data));
      this.onAccountChange.next(accounts[0]);
    });
  };
  
  public async loginWith(provider: string): Promise<boolean>{
    if(!this._window) return false;
    const providerDetail = this.walletDiscovery.getProvider(provider);
    if(providerDetail){
      const web3 = new Web3(providerDetail.provider);
      const [address] = await web3.eth.requestAccounts();
      if (!address) return false;
      let creds: UserLogin = {
        provider: provider,
        username: address
      }
      localStorage.setItem('user-login', JSON.stringify(creds));
      return true;
    }
    return false;
  } 

  public logout(){
    const creds: UserLogin | null = JSON.parse('user-login');
    if(creds)
      this._revokeWalletPermission(creds.provider);
    localStorage.removeItem('user-login');
    localStorage.removeItem('game-data');
  }

  public async getConnectedAccounts() : Promise<string[]>{
    return !this.watched ? [] :  await new Web3(this.watched).eth.getAccounts();
  }

  //TODO
  public sign(credentials: UserLogin) : Observable<boolean>{
    return this.http.post<boolean>(this.authUrl, credentials)
                    .pipe(response => {
                       //store 
                       return response
                    });
  }
  
  private watch(provider: EIP1193Provider): void {
    if (this.watched === provider) return;
    this.unwatch();
    provider.on('accountsChanged', this.onAccountsChanged);
    this.watched = provider;
  }

  private unwatch(): void {
    this.watched?.removeListener('accountsChanged', this.onAccountsChanged);
    this.watched = null;
  }

  private async _revokeWalletPermission(providerName: string){
    try{
      const providerDetail = this.walletDiscovery.getProvider(providerName);
      if(providerDetail){
          await providerDetail.provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      }
    }catch(error){
      console.log('revoke wallet permissions error', error);
    }
  }

  private _readStoredLogin(): UserLogin | null {
    try {
      return JSON.parse(localStorage.getItem('user-login') ?? 'null');
    } catch {
      return null;
    }
  }
}
