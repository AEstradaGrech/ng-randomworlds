import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CollectionResponse, QueryFilter } from '../../shared/models/common-interfaces';
import { ChatDocDto } from '../../shared/models/prompting-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatPromptsMgmtService {


  private _baseUrl:string = 'http://localhost:8000/session/chats'
  constructor(private http:HttpClient) { }

  public query(filter: QueryFilter): Observable<CollectionResponse<ChatDocDto>>{
    return this.http.post<CollectionResponse<ChatDocDto>>(`${this._baseUrl}/query`, filter)
  } 
  public delete(id:string) : Observable<boolean>{
    return this.http.delete<boolean>(`${this._baseUrl}/${id}`)
  }
  public update(dto:ChatDocDto) : Observable<ChatDocDto>{
    return this.http.put<ChatDocDto>(`${this._baseUrl}/document/update`, dto)
  }
}
