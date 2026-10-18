import { computed, DestroyRef, inject, Injectable, NgZone, signal } from '@angular/core';

import { firstValueFrom, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WINDOW } from '../../constants/window';
import { EIP1193Provider, LoginSignRequest, UserLogin } from '../../interfaces/auth/credentials.interface';
import { WalletDiscoveryService } from 'src/app/modules/shared/services/wallet-discovery.service';
import Web3 from 'web3';
import { Router } from '@angular/router';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { 
    const loggedUser = this.userLogin();
    if(loggedUser){
      const providerDetail = this.walletDiscovery.getProvider(loggedUser.provider);
      if(providerDetail)
        this._watch(providerDetail.provider);
    }

  }

  public onAccountChange: Subject<string> = new Subject<string>(); 
  public userLogin = signal<UserLogin | null>(this._readStoredLogin());
  public currentProvider = computed<EIP1193Provider | null>(() => {
    const userLogin: UserLogin | null = this.userLogin();
    if(userLogin){
      const providerDetail = this.walletDiscovery.getProvider(userLogin.provider);
      return providerDetail ? providerDetail.provider : null;
    }
    return null;
  })

  private readonly _window = inject(WINDOW);
  private readonly walletDiscovery = inject(WalletDiscoveryService);
  private _router: Router = inject(Router);
  private _zone: NgZone = inject(NgZone);

  private _watched: EIP1193Provider | null = null;

  
  public async loginWith(provider: string): Promise<boolean>{
    if(!this._window) return false;
    const providerDetail = this.walletDiscovery.getProvider(provider);
    if(providerDetail){
      const web3 = new Web3(providerDetail.provider);
      const [address] = await web3.eth.requestAccounts();
      if (!address) return false;
      // At this point the user has connected his wallet but 
      // the login is not signed (not verified, no JWT, no expiration)
      // Setting the user login updates the 'currentProvider' computed signal
      // which is required to get the 'currentChainId', which is required to
      // sign the login and generate the JWT
      this._storeUserLogin(address, provider);
      if(await this.sign(address))
        return true;
      // if the backend signing fails, the login is deleted and 
      // the loginWith method returns false
      else localStorage.removeItem('user-login');
    }
    return false;
  } 

  public async sign(address: string) : Promise<boolean>{
    try{
      const creds: UserLogin | null = this._readStoredLogin();
      if(!creds) return false;
      const web3 = this._web3FromProvider();
      const chainId = await this.getConnectedChainId();
      const siweAddress = web3.utils.toChecksumAddress(address);
      const { nonce } = await firstValueFrom(this.http.get<{ nonce: string }>(`${environment.baseUrl}/blockchain/auth/nonce/${siweAddress}`));
      const verifyRequest: LoginSignRequest = {
        domain: environment.domain,
        address:siweAddress,
        chainId: chainId,
        nonce: nonce,
        issuedAt: new Date().toISOString(),
        message:'',
        signature: ''
      }
      const siweMessage = this._buildSiweMessage(verifyRequest);
      verifyRequest.message = siweMessage;
      // trigger provider popup to sign
      verifyRequest.signature = await web3.eth.personal.sign(siweMessage, siweAddress, '');
      const recoveredAddress = await firstValueFrom(this.http.post(`${environment.baseUrl}/blockchain/auth/verify`, verifyRequest));
      return recoveredAddress && recoveredAddress === siweAddress;
    }catch(error){
      throw new Error(`An error has occured while verifying the login: ${error}`);
    }
  }

  public logout(){
    const creds: UserLogin | null = JSON.parse(localStorage.getItem('user-login') ?? '');
    if(creds)
      this._revokeWalletPermission(creds.provider);
    localStorage.removeItem('user-login');
    localStorage.removeItem('game-data');
    this.userLogin.set(null);
  }

  public async getConnectedAccounts() : Promise<string[]>{
    return !this._watched ? [] :  await new Web3(this._watched).eth.getAccounts();
  }

  public async getConnectedChainId() : Promise<number>{
    const web3 = this._web3FromProvider();
    return Number(await web3.eth.net.getId());
  }

  // arrow function for removeListener 
  private readonly _onAccountsChanged = (accounts: string[]) => {
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

  private _watch(provider: EIP1193Provider): void {
    if (this._watched === provider) return;
    this._unwatch();
    provider.on('accountsChanged', this._onAccountsChanged);
    this._watched = provider;
  }

  private _unwatch(): void {
    this._watched?.removeListener('accountsChanged', this._onAccountsChanged);
    this._watched = null;
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

  //Gets a web3 instance for the current (loged) provider
  private _web3FromProvider() : Web3{
    const provider = this.currentProvider();
    if(!provider)
      throw new Error('No connected provider found');
    return new Web3(provider);
  }

  private _storeUserLogin(wallet:string, provider:string){
    let creds: UserLogin = {
      provider: provider,
      username: wallet
    }
    localStorage.setItem('user-login', JSON.stringify(creds));
    this.userLogin.set(creds);
  }

  private _readStoredLogin(): UserLogin | null {
    try {
      return JSON.parse(localStorage.getItem('user-login') ?? 'null');
    } catch {
      return null;
    }
  }

  // EIP-191
  private _buildSiweMessage(data: LoginSignRequest): string {
    return [
      `${location.host} wants you to sign in with your Ethereum account:`,
      data.address,
      '',
      'Sign in to RandomWorlds.',
      '',
      `URI: ${location.origin}`,
      'Version: 1',
      `Chain ID: ${data.chainId}`,
      `Nonce: ${data.nonce}`,
      `Issued At: ${data.issuedAt}`,
    ].join('\n');
  }
}
