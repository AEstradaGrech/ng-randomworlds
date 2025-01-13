import { Injectable } from '@angular/core';
import { CharacterMetadata } from 'src/app/core/interfaces/business/prompting.interface';

@Injectable({
  providedIn: 'root'
})
export class SmartContractsService {

  constructor() { }

  //instanciar contrato w/abi
  // recuperar blockchain data
  // mappear
  public getMockedNFTs(): CharacterMetadata[]{
    return [
      {
        id:1,
        name: "Dark Animist",
        age: "UNKNOWN",
        appereance: "The Dark Animist wears a mix of fur-lined and leather furs with bones, antlers or animal hides attached to them. Their face is painted in dark colors representing the spirits they communicate with.",
        background: "In this world where magic has been outlawed by the Church, those who practice it are forced to live on the fringes of society. The Dark Animist lives deep into a forest and communicates only through whispers carried away from their village.",
        personality: "The animists believe that all living things have spirits within them which can be communicated with if you know how.",
        motivations: "Their primary goal is to maintain the balance between nature's forces, keeping evil at bay. They are driven by a desire for harmony and peace in their world.",
        iconicMoment: "The Dark Animist stands atop an ancient tree stump surrounded by candles made from animal fat that cast flickering shadows on nearby trees.",
        comment: "Those who seek to understand the balance of nature must first learn its language.",
        fileName: "DarkAnimist",
        imageType:".png",
        ambiences:["Fantasy", "Medieval"],
        moods:["Black Magic", "Superstition", "Epic Saga"]
      },
      {
        id:2,
        name: "Lucas 'Lucky' Rios",
        age: "32 ",
        appereance: "Rios is a tall and lean figure with short spiky hair dyed in shades of indigo. His eyes are an unnatural shade of green, courtesy of cybernetic enhancements that also grant him enhanced strength and agility.",
        background: "Lucas Rios was once the leader of one of Neo-peace's most feared street gangs before being forced to flee after a botched heist went wrong. He now leads his crew in secret from an abandoned skyscraper, always staying ahead of their pursuers by exploiting the city's crumbling infrastructure.",
        personality: "Rios is cunning and resourceful with no qualms about using violence or deception when necessary. Despite this tough exterior, however, he has a soft spot for those less fortunate than himself - especially children who remind him of his own troubled past",
        motivations: "Lucas' primary goal remains survival in the harsh world outside Neo-peace's walls and to protect what little family he still has left.",
        iconicMoment: "Rios stands atop a crumbling skyscraper, gazing out over the dystopian cityscape below. His cybernetically enhanced eyes scan for any signs of danger as his crew moves stealthily through the shadows behind him",
        comment: "...Survival is just another word for rebellion.",
        fileName:'Char2',
        imageType:'.png',
        ambiences:["Sci-fi", "Belic"],
        moods:["Cyberpunk", "Dystopia"]
      }
    ]
  } 
}
