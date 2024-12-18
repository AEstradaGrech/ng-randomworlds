import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginCredentialsDto } from '../../../core/interfaces/auth/credentials.interface';
import { Router } from '@angular/router';
import Web3 from 'web3';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  
  public working:boolean = false;
  public error:string = '';
  public maxUserLength: number = 30;
  public maxPassLength: number = 30;

  private window: any;
  private _snackBar = inject(MatSnackBar)
  constructor(@Inject(DOCUMENT) private document: Document,private fb: FormBuilder, private authService: AuthService, private router: Router){
    this.window = this.document.defaultView;
  }

  public loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
    //let account = web3.ether.getAccounts()
  }

  public getError(controlName:string, errorType:string) {
    let hasError: boolean = false;
    const control = this.loginForm.get(controlName);
    if(control && control.touched && control.errors != null)
      hasError = errorType in control.errors ? true : false;
    return hasError;
  }

  public onSubmit(){
    console.log('LOGIN SUBMIT');
    let creds:LoginCredentialsDto={
      userId: this.loginForm.get('userId')?.value,
      password: this.loginForm.get('password')?.value
    }
    this.router.navigateByUrl('randomworlds/home');
    // this.authService.login(creds).subscribe(response =>{
    //   //notify errors ||
    //   // request UserDto w/roles
    //   // redirect to 'home' | 'admin-page'
     
    // })
  }

  //https://docs.moralis.com/authentication-api/evm/how-to-sign-in-with-metamask-angular
  //https://second-pocket-shoot-73.hashnode.dev/how-to-build-a-web3-login-with-web3js-library
  //https://dev.to/macaoblog/angular-web3-10hg <-- (failed) service
  public async onMetamaskLogin(){
    console.log('-- on metamask login --')
    try{
      if (this.window.ethereum) {
        this.window.web3 = new Web3(this.window.ethereum);
        await this.window.ethereum.enable();
        let accounts = await this.window.web3.eth.getAccounts()
        console.log('--accounts--', accounts);
        if(accounts.length <= 0){
          this._snackBar.open("An error has occured while loging with MetaMask", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
          return;
        }
        this._snackBar.open("Welcome to the Random Worlds!", undefined, { duration: 2500,panelClass: ['snack-success'], verticalPosition: 'bottom'})
        this.router.navigateByUrl('randomworlds/home');
        //// 5. check if user is already logged in and update the global userWalletAddress variable
        //window.userWalletAddress = window.localStorage.getItem("userWalletAddress");
      }
    }catch(error){
      console.log('-- on error --', error)
      this._snackBar.open("An error has occured while loging with MetaMask", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
    }
    
  }
}
