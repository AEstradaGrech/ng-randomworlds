import { Component, computed, signal, OnInit, inject, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserLogin, AppWallet, WalletId } from 'src/app/core/interfaces/auth/credentials.interface';
import { WalletDiscoveryService } from '../../shared/services/wallet-discovery.service';
import { WINDOW } from 'src/app/core/constants/window';

interface World {
  id: string;
  name: string;
  genre: string;
  image: string;
  glow: string;
}

const assetImagesPath:string = 'assets/images';
// // TODO: autoUpdate py-diff
const WORLDS: World[] = [
  { id: 'desert', name: 'Arrakis', genre: 'Science Fiction', image: `${assetImagesPath}/login_desierto.svg`, glow: '#f7b46a' },
  { id: 'forest', name: 'Uffrith', genre: 'Dark Fantasy', image: `${assetImagesPath}/login_bosque.svg`, glow: '#c3ead7' },
];

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  
  private readonly _window = inject(WINDOW);
  private _snackBar = inject(MatSnackBar)
  private readonly _router = inject(Router);
  private readonly _walletDiscovery = inject(WalletDiscoveryService);
  private readonly _authService = inject(AuthService)
  protected readonly worldIndex = signal(Math.floor(Math.random() * WORLDS.length));
  protected readonly world = computed(() => WORLDS[this.worldIndex()]);

  protected readonly connecting = signal<WalletId | null>(null);
  protected readonly error = signal<string | null>(null);
  private _selectedWallet:string | null = null; 
  public get wallets(): AppWallet[]{
    return this._walletDiscovery.wallets;
  }

  @HostListener('window:beforeunload', ['$event'])
  public onWindowClose(event: any){
    if(this._selectedWallet)
      this._authService.logout(this._selectedWallet);
  }
  ngOnInit(): void {
    this._authService.logout();
  }

  protected readonly installed = computed(() =>  ({
    metamask: this._walletDiscovery.metamask(),
    phantom: !!this._window?.phantom?.solana?.isPhantom,
  }));

  protected nextWorld(): void {
    this.worldIndex.update(i => (i + 1) % WORLDS.length);
  }

  protected async connect(wallet: AppWallet): Promise<void> {
    this.error.set(null);
    this.connecting.set(wallet.id);
    this._selectedWallet = wallet.name;
    try {
      let logedIn = await this._authService.loginWith(wallet.name);
      if(logedIn){
        const creds: UserLogin | null = this._authService.userLogin();
        if(creds && creds.provider === wallet.name && creds.username){
          this._snackBar.open("Welcome to the Random Worlds!", undefined, { duration: 2500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
          localStorage.removeItem('game-data');
          await new Promise(resolve => setTimeout(resolve, 1200));
          this._router.navigateByUrl('randomworlds/home');
        }
        else this.error.set("An error has occured while loging. Invalid credentials. Try again");
      }
      else this._snackBar.open(`An error has occured while loging with ${wallet.name}`, undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
    } catch {
      this.error.set(`No se pudo conectar con ${wallet.name}. Comprueba que la extensión está desbloqueada y vuelve a intentarlo.`);
      this._authService.logout(this._selectedWallet);
    } finally {
      this.connecting.set(null);
      this._selectedWallet = null;
    }
  }
}
