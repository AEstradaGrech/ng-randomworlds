import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneratedImageDto, GenerateImageResponse, GenerateImageRequest } from '../../shared/models/images.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  private _baseUrl:string = 'http://localhost:8000/images'
  constructor(private http:HttpClient) { }

  generate(req: GenerateImageRequest) : Observable<GenerateImageResponse[]>{
    return this.http.post<any>(`${this._baseUrl}/generate/prompt`, req)
  }
  apiInference(req: GenerateImageRequest) : Observable<GenerateImageResponse>{
    return this.http.post<any>(`${this._baseUrl}/generate/inference-api/prompt`, req)
  }
  getLastWithName(name:string) : Observable<GeneratedImageDto>{
    return this.http.get<GeneratedImageDto>(`${this._baseUrl}/last/by-name/${name}`)
  }
}
