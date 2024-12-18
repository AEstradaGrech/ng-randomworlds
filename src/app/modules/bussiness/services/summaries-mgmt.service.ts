import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatSummaryDto, ChatSummaryRequest, ChatSummaryResponse, SummaryDto } from '../../shared/models/mgmt-interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SummariesMgmtService {

  private _baseUrl:string = 'http://localhost:8000/mgmt/summaries'
  constructor(private http:HttpClient) { }

  public getByChatId(chatId:string):Observable<ChatSummaryDto>{
    return this.http.get<ChatSummaryDto>(`${this._baseUrl}/chat/${chatId}`)
  }
  public summarize(dto: ChatSummaryRequest): Observable<ChatSummaryResponse>{
    return this.http.post<ChatSummaryResponse>(`${this._baseUrl}/summarize/session`, dto)
  }
  public saveSummary(dto:SummaryDto): Observable<SummaryDto>{
    return this.http.post<SummaryDto>(`${this._baseUrl}/save`, dto)
  }
}
