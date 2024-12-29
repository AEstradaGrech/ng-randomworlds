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
        description: 'Appereance & Background & Personality & Motivations', //TODO: una estructura clara para la metadata
        fileName:'Char1',
        imageType:'.png',
        ambiences:["Fantasy", "Medieval"],
        moods:["Dark", "Horror"]
      },
      {
        id:2,
        name: 'Char_2',
        description: 'Dark-fantasy / horror character',
        fileName:'Char2',
        imageType:'.png',
        ambiences:["Sci-fi", "Belic"],
        moods:["Cyberpunk", "Dystopia"]
      }
    ]
  } 
}
