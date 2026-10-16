import { DOCUMENT } from "@angular/common";
import { inject, InjectionToken } from "@angular/core";

export const WINDOW = new InjectionToken<Window | null>('WINDOW', {
  factory: () => inject(DOCUMENT).defaultView,
});

declare global {
  interface Window {
    ethereum?: { isMetaMask?: boolean; request(args: { method: string; params?: unknown[] }): Promise<unknown> };
    phantom?: { solana?: { isPhantom?: boolean } };
  }
}
export {};