import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { QuestInitRequest } from 'src/app/core/interfaces/business/prompting.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  private _baseUrl:string = 'http://localhost:9000/random-quest'
  constructor(private http: HttpClient) { }
  public test():Observable<string>{
    return this.http.get<string>(`${this._baseUrl}/test`)
  }
  public initQuest(req:QuestInitRequest):Observable<any>{
    return this.http.post(`${this._baseUrl}/init`, req, {
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
  //handleQuest
}
