import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { QuestBlockDto, QuestInitRequest, RandomQuestDto } from 'src/app/core/interfaces/business/prompting.interface';
import { CollectionResponse, SortedFilter } from '../../shared/models/common-interfaces';

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
  
  public sortedQuery(filter:SortedFilter):Observable<CollectionResponse<RandomQuestDto>>{
    return this.http.post<CollectionResponse<RandomQuestDto>>(`${this._baseUrl}/sorted-query`,filter)
  }

  public setQuestStatus(id:string, status:string) : Observable<RandomQuestDto>{
    return this.http.get<RandomQuestDto>(`${this._baseUrl}/${id}/set-status/${status}`)
  }
  
  public handleQuest(id:string, currentBlock:QuestBlockDto) : Observable<any>{
    return this.http.post(`${this._baseUrl}/${id}/handle`, currentBlock, {
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
}
