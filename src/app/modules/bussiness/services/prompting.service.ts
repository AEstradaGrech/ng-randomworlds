import { Injectable } from '@angular/core';
import { EndSessionRequest, InitSessionRequest, SessionPromptRequest } from '../../shared/models/prompting-interfaces';
import { catchError, filter, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { EventSourcePolyfill } from 'event-source-polyfill';
@Injectable({
  providedIn: 'root'
})
export class PromptingService {
  private streamSub = new Subject<string>()
  private readonly baseUrl = 'http://localhost:8000/prompt/session';
  constructor(private http: HttpClient) { }

  public initSession(req:InitSessionRequest) : Observable<any>{
    return this.http.post(`${this.baseUrl}/session/init`, req)
  }
  
  initSessionStream(req:InitSessionRequest): Observable<any> {
    return this.http
      .post('http://localhost:8000/prompt/session/init/stream', req, {
        responseType: 'text',
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        filter(
          (event: HttpEvent<string>): boolean =>
            event.type === HttpEventType.DownloadProgress ||
            event.type === HttpEventType.Response,
        ))
  }
  
  sessionPromptStream(req:SessionPromptRequest) : Observable<any>{
    return this.http
      .post('http://localhost:8000/prompt/session/chat/stream', req, {
        responseType: 'text',
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        filter(
          (event: HttpEvent<string>): boolean =>
            event.type === HttpEventType.DownloadProgress ||
            event.type === HttpEventType.Response,
        ))
  }

  endSession(req:EndSessionRequest) : Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/end`, req)
  }
}
