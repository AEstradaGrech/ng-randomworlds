import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MintCharacterRequest, TicketDto } from 'src/app/core/interfaces/business/prompting.interface';

@Injectable({
  providedIn: 'root'
})
export class MgmtService {

  private _baseUrl:string = 'http://localhost:9000/randomworlds';
  private _http:HttpClient = inject(HttpClient);

  public uploadCustomCharacter(wallet:string, contract:string, req: MintCharacterRequest) : Observable<TicketDto>{
    return this._http.post<TicketDto>(`${this._baseUrl}/blockchain/customchar/ipfs/upload/${wallet}/${contract}`,req);
  }

  public getCurrentTicket(wallet:string, contract:string, signed: boolean) : Observable<TicketDto>{
    return this._http.get<TicketDto>(`${this._baseUrl}/blockchain/customchar/ticket/wallet/${wallet}/contract/${contract}?signed=${signed}`)
  }
}
