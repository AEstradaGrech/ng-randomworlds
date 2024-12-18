import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionDto, SessionHistoryUpdateRequest, SessionRetagRequest } from '../../shared/models/mgmt-interfaces';
import { CollectionResponse, QueryFilter } from '../../shared/models/common-interfaces';
import { ChatDocDto } from '../../shared/models/prompting-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SessionsMgmtService {
  private _baseUrl:string = "http://localhost:8000/session"  
  constructor(private http:HttpClient) { }
  
  public getSessionById(id:string) : Observable<SessionDto>{
    return this.http.get<SessionDto>(`${this._baseUrl}/${id}`)
  }
  public getLastSessionWithTag(tag:string) : Observable<SessionDto>{
    return this.http.get<SessionDto>(`${this._baseUrl}/last/containing-tag/${tag}`)
  }
  public getSessionsWithTag(tag:string) : Observable<SessionDto[]>{
    return this.http.get<SessionDto[]>(`${this._baseUrl}/containing-tag/${tag}`)
  }
  public updateSessionChat(req: SessionHistoryUpdateRequest) : Observable<any[]>{
    return this.http.post<any[]>(`${this._baseUrl}/chat/update`,req)
  }
  public getSessionChatById(chat_id:string) : Observable<any>{
    return this.http.get<any>(`${this._baseUrl}/chats/${chat_id}`)
  }
  public retagSession(req: SessionRetagRequest) : Observable<SessionDto>{
    return this.http.post<SessionDto>(`${this._baseUrl}/retag`, req)
  }
  public query(filter: QueryFilter): Observable<CollectionResponse<SessionDto>>{
    return this.http.post<CollectionResponse<SessionDto>>(`${this._baseUrl}/query`, filter)
  } 
  public delete(id:string) : Observable<boolean>{
    return this.http.delete<boolean>(`${this._baseUrl}/${id}`)
  }
  public update(dto:SessionDto) : Observable<SessionDto>{
    return this.http.put<SessionDto>(`${this._baseUrl}/update`, dto)
  }
  public getSessionChats(id:string) : Observable<ChatDocDto[]>{
    return this.http.get<ChatDocDto[]>(`${this._baseUrl}/all-chats/${id}`)
  }
  public setCurrentChat(id:string, chatId:string) : Observable<SessionDto>{
    return this.http.patch<SessionDto>(`${this._baseUrl}/${id}/set-current-chat/${chatId}`, null)
  }
}
