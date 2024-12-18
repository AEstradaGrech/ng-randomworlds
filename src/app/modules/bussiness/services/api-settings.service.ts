import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailableDiffusersDto } from '../../shared/models/mgmt-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiSettingsService {

  constructor(private http: HttpClient) { }
  private _baseUrl:string = 'http://localhost:8000/mgmt/api-settings'
  public getApiSettings() : Observable<any>{
    return this.http.get<any>(`${this._baseUrl}/summary`)
  }
  public getAvailableDiffusers(): Observable<AvailableDiffusersDto>{
    return this.http.get<AvailableDiffusersDto>(`${this._baseUrl}/available-diffusers`)
  }
}
