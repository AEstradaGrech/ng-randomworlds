import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CollectionResponse, QueryFilter } from '../../shared/models/common-interfaces';
import { SysMessageTypeDto, SystemMessageDto } from '../../shared/models/mgmt-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SysMsgMgmtService {

  private _baseUrl:string = 'http://localhost:8000/mgmt/sys_messages'
  constructor(private http:HttpClient) { }

  public query(filter: QueryFilter): Observable<CollectionResponse<SystemMessageDto>>{
    return this.http.post<CollectionResponse<SystemMessageDto>>(`${this._baseUrl}/query`, filter)
  }
  public add(dto: SystemMessageDto) : Observable<SystemMessageDto>{
    return this.http.post<SystemMessageDto>(`${this._baseUrl}/create`, dto)
  }
  public delete(id:string) : Observable<boolean>{
    return this.http.delete<boolean>(`${this._baseUrl}/${id}`)
  }
  public update(dto:SystemMessageDto) : Observable<SystemMessageDto>{
    return this.http.put<SystemMessageDto>(`${this._baseUrl}/update`, dto)
  }
  public getMessageTypes() : Observable<SysMessageTypeDto[]>{
    return this.http.get<SysMessageTypeDto[]>(`${this._baseUrl}/msg/types`)
  }
}
