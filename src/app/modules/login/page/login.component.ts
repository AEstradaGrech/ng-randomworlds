import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginCredentialsDto } from '../../../core/interfaces/auth/credentials.interface';
import { Router } from '@angular/router';

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


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router){

  }

  public loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
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

  public onMetamaskLogin(){
    console.log('-- on metamask login --')
  }
}
