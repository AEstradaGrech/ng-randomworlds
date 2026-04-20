import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneratedImageDto, GenerateImageResponse, GenerateImageRequest } from '../../shared/models/images.interfaces';
import { environment } from 'src/environments/environment';
import { CollectionResponse, QueryFilter } from '../../shared/models/common-interfaces';
import { SystemMessageDto } from '../../shared/models/mgmt-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  // private _baseUrl:string = `${environment.baseUrl}/images`;
  private _baseUrl:string = 'http://localhost:8080/images';
  private _mgmtUrl: string = 'http://localhost:9000/randomworlds/mgmt/sys-messages';

  constructor(private http:HttpClient) { }

  generate(req: GenerateImageRequest) : Observable<GenerateImageResponse[]>{
    return this.http.post<any>(`${this._baseUrl}/generate/prompt`, req)
  }

  getLastWithName(name:string) : Observable<GeneratedImageDto>{
    return this.http.get<GeneratedImageDto>(`${this._mgmtUrl}/last/by-name/${name}`)
  }

  getAmbiences(filter: QueryFilter | null = null) : Observable<CollectionResponse<SystemMessageDto>>{  
    return this.http.post<CollectionResponse<SystemMessageDto>>(`${this._mgmtUrl}/query`, filter ?? { conditions: [{field:'tag', value:'ambience'}]});
  }
  
  getMoods(filter: QueryFilter | null = null) : Observable<CollectionResponse<SystemMessageDto>>{
    return this.http.post<CollectionResponse<SystemMessageDto>>(`${this._mgmtUrl}/query`, filter ?? { conditions: [{field:'tag', value:'mood'}]});
  }
}
