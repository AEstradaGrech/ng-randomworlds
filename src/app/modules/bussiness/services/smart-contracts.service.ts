import { Injectable } from '@angular/core';
import { CharacterNFT_Mock } from 'src/app/core/interfaces/business/prompting.interface';

@Injectable({
  providedIn: 'root'
})
export class SmartContractsService {

  constructor() { }

  //instanciar contrato w/abi
  // recuperar blockchain data
  // mappear
  public getMockedNFTs(): CharacterNFT_Mock[]{
    return [
      {
        id:1,
        name: 'Char_1',
        description: 'Dark-fantasy / horror character',
        fileName:'Char1',
        imageType:'.png',
        genres:["Fantasy", "Dark", "Horror", "Medieval"]
      },
      {
        id:2,
        name: 'Char_2',
        description: 'Dark-fantasy / horror character',
        fileName:'Char2',
        imageType:'.png',
        genres:["Sci-fi", "Cyberpunk", "Dystopia"]
      }
    ]
  } 
}
