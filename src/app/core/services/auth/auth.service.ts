import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WINDOW } from '../../constants/window';
import { UserLogin } from '../../interfaces/auth/credentials.interface';
import { WalletDiscoveryService } from 'src/app/modules/shared/services/wallet-discovery.service';
import Web3 from 'web3';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  private readonly _window = inject(WINDOW);
  private readonly walletDiscovery = inject(WalletDiscoveryService);

  private authUrl:string = ''

  public async loginWith(provider: string): Promise<boolean>{
    if(!this._window) return false;
    const providerDetail = this.walletDiscovery.getProvider(provider);
    if(providerDetail){
      const web3 = new Web3(providerDetail.provider);
      const [address] = await web3.eth.requestAccounts();
      let creds: UserLogin = {
        provider: provider,
        username: address
      }
      console.log('login creds', creds);
      localStorage.setItem('user-login', JSON.stringify(creds));
      providerDetail.provider.on('accountsChanged', (accounts: string[]) => {

      })
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

  public sign(credentials: UserLogin) : Observable<boolean>{
    return this.http.post<boolean>(this.authUrl, credentials)
                    .pipe(response => {
                       //store 
                       return response
                    });
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
}
