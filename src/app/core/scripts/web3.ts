import Web3 from 'web3';
import { UserLogin } from '../interfaces/auth/credentials.interface';
import { inject } from '@angular/core';
import { WalletDiscoveryService } from 'src/app/modules/shared/services/wallet-discovery.service';
const web3 = ()=>{
    const login: UserLogin = JSON.parse(localStorage.getItem('user-login') ?? '');
    
    if(!login) return undefined;

    const walletService = inject(WalletDiscoveryService);

    switch(login.provider){
        case('metamask'):
            return new Web3(walletService.metamask()?.provider);
        // case('solana'):
        //     return new Web3(window.ethereum)
        // case('other wallet'):
        //      return ?
    }
    // codigo antiguo:
    // let window:any = document.defaultView;
    // if (window && window.ethereum) 
    //     return new Web3(window.ethereum);
    /*
    else{
        const provider = new Web3.providers.HttpProvider(dotEnv.parsed['INFURA_ENDPOINT']);
        web3 = new Web3(provider);
    }
    */
    return undefined; // Todo Truffle HDwallet provider
}
export default web3