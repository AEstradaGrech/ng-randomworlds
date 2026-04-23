import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { CreateCharacterRequest, QuestBlockDto, QuestCharacter, QuestInitRequest, QuestIntroRequest, QuestIntroResponse, RandomQuestDto, SceneOptionsRequest, SceneOptionsResponse } from 'src/app/core/interfaces/business/prompting.interface';
import { CollectionResponse, SortedFilter } from '../../shared/models/common-interfaces';
import { environment } from 'src/environments/environment';
import { CharacterProfileDto } from '../../shared/models/mgmt-interfaces';
@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  // private _baseUrl:string = `${environment.baseUrl}/random-quest`
  private _baseUrl:string = 'http://localhost:9000/randomworlds/random-quest'
  constructor(private http: HttpClient) { }

  public initQuestStream(req:QuestInitRequest):Observable<any>{
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
  public handleQuestStream(id:string, currentBlock:QuestBlockDto) : Observable<any>{
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
  public sortedQuery(filter:SortedFilter):Observable<CollectionResponse<RandomQuestDto>>{
    return this.http.post<CollectionResponse<RandomQuestDto>>(`${this._baseUrl}/sorted-query`,filter)
  }
  public setQuestStatus(id:string, status:string) : Observable<RandomQuestDto>{
    return this.http.get<RandomQuestDto>(`${this._baseUrl}/${id}/set-status/${status}`)
  }
  public getById(id:string) : Observable<RandomQuestDto>{
    return this.http.get<RandomQuestDto>(`${this._baseUrl}/${id}`)
  }
  public endQuest(id:string, status:string, block:QuestBlockDto) : Observable<RandomQuestDto>{
    return this.http.post<RandomQuestDto>(`${this._baseUrl}/${id}/end/${status}`, block)
  }
  public generateSceneOptions(req:SceneOptionsRequest) : Observable<SceneOptionsResponse>{
    return this.http.post<SceneOptionsResponse>(`${this._baseUrl}/scene-options`,req)
  }
  public generateIntro(req:QuestIntroRequest) : Observable<QuestIntroResponse>{
    console.log('generate intro')
    return this.http.post<QuestIntroResponse>(`${this._baseUrl}/intro`, req)
  }

  public generateCharacterProfile(req: CreateCharacterRequest): Observable<QuestCharacter>{
    return this.http.post<QuestCharacter>(`${this._baseUrl}/character`, req);
  }
}
