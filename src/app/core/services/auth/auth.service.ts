import { Injectable } from '@angular/core';
import { LoginCredentialsDto } from '../../interfaces/auth/credentials.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  private authUrl:string = ''

  public login(credentials: LoginCredentialsDto) : Observable<boolean>{
    return this.http.post<boolean>(this.authUrl, credentials)
                    .pipe(response => {
                       //store 
                       return response
                    });
  }
}
