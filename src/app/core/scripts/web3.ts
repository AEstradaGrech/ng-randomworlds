import Web3 from 'web3';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
const web3 = ()=>{
    const authService = inject(AuthService);
    if(authService){
        const provider = authService.currentProvider();
        return provider ? new Web3(provider) : undefined;
    }
    return undefined; // Todo Truffle HDwallet provider
}
export default web3