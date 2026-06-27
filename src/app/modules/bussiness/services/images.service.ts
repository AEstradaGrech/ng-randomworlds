import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { GeneratedImageDto, GenerateImageResponse, GenerateImageRequest, ProviderSettingsDto, IntegrationSettingsDto, SetIntegrationRequest } from '../../shared/models/images.interfaces';
import { environment } from 'src/environments/environment';
import { CollectionResponse, QueryFilter } from '../../shared/models/common-interfaces';
import { SystemMessageDto } from '../../shared/models/mgmt-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  // private _baseUrl:string = `${environment.baseUrl}/images`;
  private _baseUrl:string = 'http://localhost:8080';
  private _mgmtUrl: string = 'http://localhost:9000/randomworlds/mgmt/sys-messages';

  constructor(private _http:HttpClient) { }

  generate(integration:string, req: GenerateImageRequest) : Observable<GenerateImageResponse>{
    switch(integration){
      case("stablediffusion"):
        return this._http.post<GenerateImageResponse>(`${this._baseUrl}/stablediffusion/prompt/generate`, req)
      case("flux"):
        return this._http.post<GenerateImageResponse>(`${this._baseUrl}/flux/prompt/generate`, req)
      default: return of()
    }
  }

  getProviderSettings() : Observable<ProviderSettingsDto>{
    return this._http.get<ProviderSettingsDto>(`${this._baseUrl}/mgmt/provider/settings`).pipe(catchError(this._handleError))
  }

  setIntegration(req:SetIntegrationRequest) : Observable<IntegrationSettingsDto>{
    return this._http.post<IntegrationSettingsDto>(`${this._baseUrl}/mgmt/set-integration`, req)
  }

  getLastWithName(name:string) : Observable<GeneratedImageDto>{
    return this._http.get<GeneratedImageDto>(`${this._mgmtUrl}/last/by-name/${name}`)
  }

  getAmbiences(filter: QueryFilter | null = null) : Observable<CollectionResponse<SystemMessageDto>>{  
    return this._http.post<CollectionResponse<SystemMessageDto>>(`${this._mgmtUrl}/query`, filter ?? { conditions: [{field:'tag', value:'ambience'}]});
  }
  
  getMoods(filter: QueryFilter | null = null) : Observable<CollectionResponse<SystemMessageDto>>{
    return this._http.post<CollectionResponse<SystemMessageDto>>(`${this._mgmtUrl}/query`, filter ?? { conditions: [{field:'tag', value:'mood'}]});
  }

  protected _handleError(error:HttpErrorResponse){
    console.log(error.status === 0 ? `Network error: ${error.message}` : `Backend error >> status: ${error.status}`);
    return throwError(() => error.status === 0 ? new Error('Network error, please try again later.') : new Error(`Service unavailable >> status: ${error.status} - ${error.message}`))
  }
}
