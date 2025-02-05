import { Inject, Injectable } from '@angular/core';
import { CharacterInfo } from 'src/app/core/interfaces/business/prompting.interface';
import { DOCUMENT } from '@angular/common';
import Web3Provider from 'src/app/core/scripts/web3'
import Factory from 'src/app/core/scripts/immutableFactory'
import Collection from 'src/app/core/scripts/immutableCollection'
import Decrypter from 'src/app/core/scripts/profileDecrypt'
import { firstValueFrom } from 'rxjs';
import { CatalogueCollection, CharacterProfile, CollectionSummary, ModelInfo } from 'src/app/core/interfaces/business/smart-contract.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SmartContractsService {
  public web3!:any;
  public factory:any;
  public collections: CatalogueCollection[] = [];
  public connectedAccount!:string;
  constructor(@Inject(DOCUMENT) private document: Document, private http:HttpClient) { 
    console.log('-- smarts constructor --');
    this.web3 = Web3Provider(this.document);
    this.factory = Factory(this.web3);
    this.getConnectedAccounts().then(res => {
      console.log('-- smarts connected observable --', res);
      if(res.length <= 0){
        console.log('-- no accounts connected with MetaMask browser extension --');
        return;
      }
      this.connectedAccount = res[0];
      console.log('-- smart contracts service :: connected account', this.connectedAccount);
    })
    this.getCollectionsCatalogue().then(res => {
      console.log('--contract address--',this.factory._address)
      //------------- devonly -------------
      if(this.factory._address === '0x5f7b59a66B4a87fD910017abfF934852A96E596C')
        res = res.filter(x => x.contractAddress === '0x89d336B82232c680F7786e18DC3d766601F061BD');
      // ----------------------------------
      this.collections = this._mapCatalogueData(res);
      console.log('-- factory cats --', this.collections);
    })
  }
  
  public getCollectionContract(address:string) : any{
    return Collection(this.web3, address);
  }
  public async getConnectedAccounts() : Promise<any[]>{
    return await this.web3.eth.getAccounts();
  }
  public async getCollectionsCatalogue(): Promise<any[]>{
    return await this.factory.methods.getCatalogue().call();
  }
  public async getCollectionSummary(address: string): Promise<CollectionSummary>{
    let data = await this.getCollectionContract(address).methods.getContractSummary().call();
    let summary:CollectionSummary = {
      name: data.name,
      symbol: data.symbol,
      collectionName: data.collectionName,
      description: data.description,
      isFreeCollection: data.isFreeCollection,
      isLimitedCollection: data.isLimitedCollection,
      isOutOfStock: data.isOutOfStock,
      maxMints: parseInt(data.maxMints),
      totalMints: parseInt(data.totalMints),
      models: data.models,
      modelsCid: data.modelsCid,
      metaCid: data.metaCid,
      gateway:data.gateway,
      owner:data.owner
    }
    return summary;
  }
  public async getModelInfo(model:string, address:string): Promise<ModelInfo>{
    let data = await this.getCollectionContract(address).methods.modelInfo(model).call();
    let info: ModelInfo = {
      name: data.name,
      description: data.description,
      weiPrice: data.weiPrice,
      fileName: data.fileName,
      fileExtension: data.fileExtension,
      maxMints: parseInt(data.maxMints),
      mints: parseInt(data.totalMints),
      available: data.available
    }
    return info;
  }
  public async getModelMetadata(model:ModelInfo, collection: CollectionSummary, contract:any) : Promise<any>{
    let url = `${collection.gateway}/${collection.metaCid}/${model.fileName}.json`;
    console.log('meta url', url);
    let rawMetadata = await firstValueFrom(this.http.get<any>(url));
    console.log('meta resp', rawMetadata);
    let testEncryption = 'U2FsdGVkX18b/eiGmtdX/+wF9zjwoK5+0GOZiPV/iT3EyWCOewqBLivJxUJBNQDAKffDlHOmeJl+5DU1Mgl/Xd6Y94r3leWCAaTRCA7CCGeSQGQ7ZHSrp9LSF770BEGi7CedpiElyOBbZE47AYQLMv+qYL8NtmVbpOeBSzUQpeXWsBVCbvbWkuWNIxB3HETEYmadMqUEKL/bFYADBnj8zjEGjsX6PEyWhgQqJP5lP52syVPubR8KBSRqQemLEftZUm72k4e2/Nuw6T1aMJjgDyBeDsGxEJ8hJfIJNLboabV7JELJ+31/MY5JG5MRT2ylU+lX7v16AutSFiduuNSJZd1nW9Xk0tH97yeahq0Wrx2Q8ov1cVRMICLkk9vyTVrWbnI/ldi9DKE6IfCk0pe2XYb5wyEVSW0XekBP489alDQ7R56+jeKiZBrjEhXVc3JNY6oqGTl/+dutxeWazxlUHcCTHRdJFjOcfBzx/fpOJAjlplPVMAYK7uJC0ZcOQbgDnWGhzIa97niAqD+X39Prrrv63UNpJp4f0wA4XD+h35cxe/ohMdxrWkIGPpT84VMSUzHpxuReIvS/C1UjG+6twbZss7y+QfhSl8tuAox0zzLAmwwU8ygb3EOsahVd1OgDkjTEm5UrXmK1rI6cA1oIZ+N+x/3Zc1KNG8MdYTRZF73u7DB0rBZLU1PCXHixloieWv4E1LPe7kWUxVe27cTUnI0HxNwwkyWBKicXwoYSCsHa7F/v2LqaKuDD9QmN6lqpw+98i9maLdS2fzEvk2dSNbRV088Nx4RITltWrxYuPz9rgil9ESZb4UvAWufb5bTA1XXxUhggCgD5/Te7fAGhHxoK13ThiJIRTLrDboH1SLztJkqN1aicBU1jENX3SumrQzzdntXekR8PtFVzgSJKnIP12DdtmAct6cJNZR7mkyYpiWqO0/XMPWDz3IIymR5MxlZECMzfL2ws+RpX2TRNkosmFnIkEItsovujIbDOEAZ8PV1SkQGiBzIKGT+mtdpjd3mFOMyqSjoCuQrRaPT0t3myZbJ+Qy5SqsT9KiPEybSwrGagAlzG/UER7/D552pvI2aXXZjTrBCDmfqkU2zRVlz2t6aOfZJxehZKUoitT7GjNM+APDZtBQcPSaJoeVjam19xbEmUNTm6c/eRckFny9CJA2BM1reeSdab435xZGi28xJKhkk7d+EBMuOBD8T7VPv8HR8VqA0oAyzMR20Q+6dneV2J54rEIcG0UJMNIIfu7ZfFh0/CHWfCB5CBmLAbdYbSr6uEkA1RpHA77t6RwaIHAyYKBD51OXblxwcjyqk+AFOjtPR24QfW1eJ90FGToMwrt8tFrBfLGqSOf+FclFGz/FIXX4Vv7Ib52LCWFLsGo8EipJYAyrUJ7gr9pi970/u3txhO2A9O6kCG7tB/B84w5e47Q1N9HK9pwi7VZ/qHFIF/vuexuJEn5ohTiP/2pnzfoPnz7qA8U+Go7GXX5pSL2JQBQ8C+d8l3ZIqhSe4wDaO6JZw+aenWbyRwLYndzCgiGSUaStgvhHL/OeqWspU+cxCZSnLazeUCWx4E/b+9ETo0ry+DJPY6xHpohHCfqmW2TZDKfxEZyYh6EbZfP/8rCTaFEI1cwpzPYbNzDTqSANuJELPFiH6Ez9sFxLLA3voVHtQ6kAKEl59kQY6/fa211bPzyHV7ACbV8XfNrbZ3uWzfSxJ4sEunRAUna95nnRJpB+3rz16heD/Tyh+YMg=='
    let profile = Decrypter(rawMetadata.encryptedProfile);
    console.log('-- decrypted char profile --', profile);
    // TODO: decrypt profile
    // let profile: CharacterProfile = {
    //   name: metadata.name,
      
    // }
    return rawMetadata;
  }
  private _mapCatalogueData(res: any) : CatalogueCollection[]{
    return res.map((item:any) => { 
      let dto: CatalogueCollection = {
        contractAddress: item.contractAddress,
        name: item.name,
        description: item.description,
        symbol: item.symbol,
        isFree: item.isFree,
        isLimited: item.isLimited,
        logoImage: item.logoImage
      }; 
      return dto;
    })
  }

  //instanciar contrato w/abi
  // recuperar blockchain data
  // mappear
  public getMockedNFTs(): CharacterInfo[]{
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
