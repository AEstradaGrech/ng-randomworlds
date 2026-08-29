import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { ChatMessage as ChatMessageDto, CreateCharacterRequest, FinalOptionsResponse, QuestBlockDto, QuestCharacter, NewQuestRequest, QuestIntroRequest, QuestIntroResponse, RandomQuestDto, RandomWorldsCharacter, SaveDatasetCharacter, SceneOptionsRequest, SceneOptionsResponse, InitQuestRequest, EndGameRequest } from 'src/app/core/interfaces/business/prompting.interface';
import { CollectionResponse, SortedFilter } from '../../shared/models/common-interfaces';
import { environment } from 'src/environments/environment';
import { CharacterProfileDto } from '../../shared/models/mgmt-interfaces';
@Injectable({
  providedIn: 'root'
})
export class QuestsService {

  // private _baseUrl:string = `${environment.baseUrl}/random-quest`
  private _baseUrl:string = 'http://localhost:9000/randomworlds/random-quest';
  private _charsUrl:string = 'http://localhost:9000/randomworlds/characters';
  constructor(private http: HttpClient) { }

  public initQuestStream(req:InitQuestRequest):Observable<any>{
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
  public handleQuestStream(id:string, currentBlock:QuestBlockDto, isOverwrite:boolean = false) : Observable<any>{
    return this.http.post(`${this._baseUrl}/${id}/handle?is_overwrite=${isOverwrite}`, currentBlock, {
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

  public saveNewQuest(req:NewQuestRequest) : Observable<RandomQuestDto>{
    return this.http.post<RandomQuestDto>(`${this._baseUrl}/new/save`,req);
  }

  public sortedQuery(filter:SortedFilter):Observable<CollectionResponse<RandomQuestDto>>{
    return this.http.post<CollectionResponse<RandomQuestDto>>(`${this._baseUrl}/sorted-query`,filter);
  }
  public setQuestStatus(id:string, status:string) : Observable<RandomQuestDto>{
    return this.http.get<RandomQuestDto>(`${this._baseUrl}/${id}/set-status/${status}`);
  }
  public getById(id:string) : Observable<RandomQuestDto>{
    return this.http.get<RandomQuestDto>(`${this._baseUrl}/${id}`);
  }
  public getCurrentQuestFor(tokenId: number, collection: string, wallet: string) : Observable<RandomQuestDto>{
    return this.http.get<RandomQuestDto>(`${this._baseUrl}/current/character/${tokenId}/collection/${collection}/owner/${wallet}`);
  }
  public endQuest(id:string, status:string, request:EndGameRequest) : Observable<RandomQuestDto>{
    return this.http.post<RandomQuestDto>(`${this._baseUrl}/${id}/end/${status}`, request);
  }
  public generateSceneOptions(req:SceneOptionsRequest) : Observable<SceneOptionsResponse>{
    return this.http.post<SceneOptionsResponse>(`${this._baseUrl}/scene-options`,req);
  }
  public generateFinalOptions(req:SceneOptionsRequest) : Observable<FinalOptionsResponse>{
    return this.http.post<FinalOptionsResponse>(`${this._baseUrl}/final-scene-options`,req);
  }
  public generateIntro(req:QuestIntroRequest) : Observable<QuestIntroResponse>{
    console.log('generate intro')
    return this.http.post<QuestIntroResponse>(`${this._baseUrl}/intro`, req);
  }

  public generateCharacterProfile(req: CreateCharacterRequest): Observable<QuestCharacter>{
    return this.http.post<QuestCharacter>(`${this._charsUrl}/generate`, req);
  }
  public saveDatasetCharacter(req: SaveDatasetCharacter): Observable<RandomWorldsCharacter>{
    return this.http.post<RandomWorldsCharacter>(`${this._charsUrl}/dataset/save`, req);
  }
  public generateCharacterImagePrompt(req: RandomWorldsCharacter): Observable<ChatMessageDto>{
    return this.http.post<ChatMessageDto>(`${this._charsUrl}/image/enhanced-generate`, req);
  }

  public patchQuestBlocks(quest: RandomQuestDto) : Observable<RandomQuestDto>{
    return this.http.post<RandomQuestDto>(`${this._baseUrl}/patch/blocks`, quest);
  }
}
