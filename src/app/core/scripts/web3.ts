import Web3 from 'web3';
import { computed, inject, Signal } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
export function injectWeb3(): Signal<Web3 | null> {
  const auth = inject(AuthService); 
  return computed(() => {
    const provider = auth.currentProvider();
    return provider ? new Web3(provider) : null;
  });
}