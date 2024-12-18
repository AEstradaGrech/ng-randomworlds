import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CharacterProfileDto } from '../../shared/models/mgmt-interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharactersService {

  constructor(private http:HttpClient) { }

  private _baseUrl:string = 'http://localhost:8000/characters'

  public addProfile(req: CharacterProfileDto) : Observable<any>{
    return this.http.post<any>(`${this._baseUrl}/add-profile`, req)
  }

  public getProfileWithTag(tag:string) : Observable<CharacterProfileDto>{
    return this.http.get<CharacterProfileDto>(`${this._baseUrl}/with-tag/${tag}`)
  }

  public getProfileContainingTag(tag:string) : Observable<CharacterProfileDto[]>{
    return this.http.get<CharacterProfileDto[]>(`${this._baseUrl}/containing-tag/${tag}`)
  }
}
