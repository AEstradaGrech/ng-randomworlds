import { EventEmitter, Inject, Injectable } from '@angular/core';
import { CharacterProfileMock } from 'src/app/core/interfaces/business/prompting.interface';
import { DOCUMENT } from '@angular/common';
import Web3Provider from 'src/app/core/scripts/web3';
import Kaka from 'src/app/core/scripts/kakaCoin';
import Crap from 'src/app/core/scripts/crapCoin';
import Web3 from 'web3';
import Factory from 'src/app/core/scripts/immutableFactory';
import Collection from 'src/app/core/scripts/immutableCollection';
import RagCharsCollection from 'src/app/core/scripts/ragCharsCollection';
import CustomChars from 'src/app/core/scripts/customCharacters';
import CustomCharsFactory from 'src/app/core/scripts/customCharsFactory';
import { firstValueFrom, Observable } from 'rxjs';
import { CatalogueCollection, CustomCharsCatalogue, CollectionSummary, ModelInfo, TokenDetails, WalletNFT } from 'src/app/core/interfaces/business/smart-contract.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SmartContractsService {
  public web3!:any;
  public factory:any;
  public collections: CatalogueCollection[] = [];
  public onPaymentReceipt: EventEmitter<any> = new EventEmitter<any>();
  public onPaymentError: EventEmitter<any> = new EventEmitter<any>();
  private _connectedAccount!:string;
  private _baseUrl:string = 'http://localhost:9000/randomworlds'

  public get connectedWallet(): string | null{
    return this._connectedAccount;
  }

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
      this._connectedAccount = res[0];
      console.log('-- smart contracts service :: connected account', this._connectedAccount);
    })
    this.getCollectionsCatalogue().then(res => {
      console.log('--contract address--',this.factory._address)
      this.collections = this._mapCatalogueData(res);
      console.log('-- factory cats --', this.collections);
    })
  }
  
  public getCustomCharactersFactory(): any{
    return CustomCharsFactory(this.web3);
  }

  public getCustomCharactersContract(address: string) : any{
    return CustomChars(this.web3, address);
  }

  public getCollectionContract(address:string) : any{
    return Collection(this.web3, address);
  }
  public getRagCharsCollectionContract() :any {
    return RagCharsCollection(this.web3, '0xA43DaCA8B909AB78367b3F1814A1080D92e05510');
  }
  public getCoinContract(symbol:string) : any {
    switch(symbol){
      case('KAKA'):
        return Kaka(this.web3);
      case('CRAP'):
        return Crap(this.web3);
      default:break;
    }
    return 
  }
  public async getConnectedAccounts() : Promise<any[]>{
    return await this.web3.eth.getAccounts();
  }
  public async getCollectionsCatalogue(): Promise<any[]>{
    return await this.factory.methods.getCatalogue().call();
  }
  public async getCustomCharsCatalogue() : Promise<CustomCharsCatalogue[]>{
    let cats = await this.getCustomCharactersFactory().methods.getCatalogue().call();
    return cats.map((cat:any) => {
      let dto: CustomCharsCatalogue = {
        contractAddress: cat.contractAddress,
        name: cat.name,
        symbol: cat.symbol,
        weiMintPrice: BigInt(cat.weiMintPrice)
      };
      return dto;
    })
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

  public async getEnabledTokens(collectionAddress:string, isCollectionContract: boolean) : Promise<string[]>{
    return isCollectionContract ?
      this.getCollectionContract(collectionAddress).methods.getEnabledTokens().call() :
      this.getCustomCharactersContract(collectionAddress).methods.enabledTokens().call();
  }

  public async getTokenDetails(collectionAddress:string, tokenSymbol: string, isCollectionContract: boolean): Promise<TokenDetails>{
    let details = isCollectionContract ?
      await this.getCollectionContract(collectionAddress).methods.paymentTokens(tokenSymbol).call() :
      await this.getCustomCharactersContract(collectionAddress).methods.paymentTokens(tokenSymbol).call();
      let dto:TokenDetails = {
      tokenContract:details.tokenContract,
      multiplier: parseInt(details.multiplier),
      decimals: parseInt(details.decimals)
    };
    return dto;
  }

  public async getModelInfo(model:string, address:string): Promise<ModelInfo>{
    let data = await this.getCollectionContract(address).methods.modelInfo(model).call();
    let info: ModelInfo = {
      name: data.name,
      description: data.description,
      price: data.weiPrice,
      fileName: data.fileName,
      fileExtension: data.fileExtension,
      maxMints: parseInt(data.maxMints),
      mints: parseInt(data.mints),
      available: data.available
    }
    return info;
  }
  // public async getModelMetadata(model:ModelInfo, collection: CollectionSummary) : Promise<CharacterMetadata>{
  //   let url = `${collection.gateway}/${collection.metaCid}/${model.fileName}.json`;
  //   console.log('meta url', url);
  //   let rawData = await firstValueFrom(this.http.get<any>(url));
  //   console.log('meta resp', rawData);
  //   let profile: CharacterProfile | null = null; //JSON.parse(Decrypter(rawData.encryptedProfile));
  //   let metadata: CharacterMetadata = {
  //     name:rawData.name,
  //     description: rawData.description,
  //     rarity: rawData.rarity,
  //     profile:profile,
  //     image: rawData.endpoint
  //   }
  //   console.log('-- decrypted char meta --', metadata);
  //   return metadata;
  // }
  // public async getCharacterMetadata(metadataUrl:string) : Promise<CharacterMetadata>{
  //   let rawData = await firstValueFrom(this.http.get<any>(metadataUrl));
  //   console.log('meta resp', rawData);
  //   let profile: CharacterProfile = JSON.parse(Decrypter(rawData.encryptedProfile));
  //   let metadata: CharacterMetadata = {
  //     name:rawData.name,
  //     description: rawData.description,
  //     rarity: rawData.rarity,
  //     profile:profile,
  //     image: rawData.endpoint
  //   }
  //   console.log('-- decrypted char meta --', metadata);
  //   return metadata;
  // }
  // public async getMetadata(model:CatalogueModel) : Promise<any>{
  //   let rawData = await firstValueFrom(this.http.get<any>(model.metadataUrl));
  //   console.log('meta resp', rawData);
  //   let profile: CharacterProfile = JSON.parse(Decrypter(rawData.encryptedProfile));
  //   let metadata: CharacterMetadata = {
  //     name:rawData.name,
  //     description: rawData.description,
  //     rarity: rawData.rarity,
  //     profile:profile,
  //     image: rawData.endpoint
  //   }
  //   console.log('-- decrypted char meta --', metadata);
  //   return metadata;
  // }
  //public async getAssetInfo()
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

  //etherPurchaseCustomCharacter(contractAddress: string, collectorAddress: string) : Promise<boolean>{} <- on confirmation
  public async etherMintCharacter(contractAddress:string, model: string, price:number, collectorAddress: string) : Promise<boolean>{
    try{
      let accounts = await this.getConnectedAccounts();
      await this.getCollectionContract(contractAddress).methods.etherMint(collectorAddress, model)
        .send({from: accounts[0], value: Web3.utils.toWei(price, 'ether')})
        .on('receipt', (receipt:any) => {
          console.log('-- on etherMint receipt --', receipt);
          this.onPaymentReceipt.emit(receipt);
          // onTransactionConfirmed.emit<any>(receipt); <- alli donde se use el servicio se crea un suscriptor que recibe los OK
        })
        .on('error', (error:any, receipt:any) => {
          console.log('-- on ether collection mint error --', error, receipt);
          this.onPaymentError.emit({ error: error, receipt: receipt});
          throw new Error(`${error}`);
	      });
        return true;
    }
    catch(error){
      console.log('-- ether mint error --',error)
      return false;
    }
  }
  public async mintCharacter(contractAddress:string, paymentToken:string, price:string, model: string, collectorAddress: string) : Promise<boolean>{
    let tokenContract = this.getCoinContract(paymentToken);
    if(tokenContract){
      try{
        let accounts = await this.getConnectedAccounts();
        console.log('price', price);
        console.log('account', accounts[0]);
        console.log('pay params: ', contractAddress, paymentToken, model, collectorAddress);
        await tokenContract.methods.approve(contractAddress, price).send({from:accounts[0]});
        await this.getCollectionContract(contractAddress).methods.customTokenMint(collectorAddress, model, paymentToken).send({from:accounts[0],gas:'7000000'})
        return true;
      }
      catch(error){
        console.log(error);
      }
    }
    return false;
  }
  
  public async etherMintCustomCharacter(contractAddress:string, price:number) : Promise<boolean>{
    try{
      let accounts = await this.getConnectedAccounts();
      await this.getCustomCharactersContract(contractAddress).methods.etherPurchase()
        .send({from: this.connectedWallet, value: Web3.utils.toWei(price, 'ether')})
        .on('receipt', (receipt:any) => {
          console.log('-- on etherMint receipt --', receipt);
          this.onPaymentReceipt.emit(receipt);
          // onTransactionConfirmed.emit<any>(receipt); <- alli donde se use el servicio se crea un suscriptor que recibe los OK
        })
        .on('error', (error:any, receipt:any) => {
          console.log('-- on ether collection mint error --', error, receipt);
          this.onPaymentError.emit({ error: error, receipt: receipt});
          throw new Error(`${error}`);
	      });
        return true;
    }
    catch(error){
      console.log('-- ether mint error --',error)
      return false;
    }
  }

  public mintCustomCharacter(contractAddress: string, paymentToken: string){
    return this.getCustomCharactersContract(contractAddress).methods.customTokenPurchase(paymentToken).send({from: this.connectedWallet})
  }
  public async mintCustomCharacterAsync(contractAddress:string, paymentToken:string) : Promise<boolean>{
    let tokenContract = this.getCoinContract(paymentToken);
    if(tokenContract){
      try{
        console.log('pay params: ', contractAddress, paymentToken, this.connectedWallet);
        await this.getCustomCharactersContract(contractAddress).methods
          .customTokenPurchase(paymentToken)
          .send({from:this.connectedWallet, gas:'7000000'})
          .on('receipt', (receipt:any) => {
            console.log('-- on etherMint receipt --', receipt);
            this.onPaymentReceipt.emit(receipt);
            // onTransactionConfirmed.emit<any>(receipt); <- alli donde se use el servicio se crea un suscriptor que recibe los OK
          })
          .on('error', (error:any, receipt:any) => {
            console.log('-- on ether collection mint error --', error, receipt);
            this.onPaymentError.emit({ error: error, receipt: receipt});
            throw new Error(`${error}`);
          });
        return true;
      }
      catch(error){
        console.log(error);
        return false;
      }
    }
    return false;
  }

  public async mintRagChar(paymentToken:string, price:string, model:string) : Promise<boolean>{
    let tokenContract = this.getCoinContract(paymentToken);
    if(tokenContract){
      try{
        let accounts = await this.getConnectedAccounts();
        console.log('price', price);
        console.log('account', accounts[0]);
        console.log('pay params: ', paymentToken, model);
        
        await tokenContract.methods.approve(accounts[0], price).send({from:accounts[0]});
        await this.getRagCharsCollectionContract().methods.customTokenMint(accounts[0], model, paymentToken).send({from:accounts[0],gas:'7000000'})
        return true;
      }
      catch(error){
        console.log(error);
      }
    }
    return false;
  }
  public async getWalletNFTs(address:string) : Promise<any>{
    let assets = await this.http.get<any>(`${this._baseUrl}/wallet-nfts/${address}`)
  }
  public async getWalletCollectionNFTs(address:string, collectionAddress:string) : Promise<any>{
    let assets = await firstValueFrom(this.http.get<any>(`${this._baseUrl}/blockchain/wallet-nfts/${address}/collection-address/${collectionAddress}`));
    return assets;
    // return assets.map((item:any) => {
    //  return this._mapWalletNFT(item);
    // })
  }
  public getWalletNFTsObservable(collectionAddress:string) : Observable<WalletNFT[]>{
    return this.http.get<any>(`${this._baseUrl}/blockchain/wallet-nfts/0xee6870759cbddfb12ee3a4547c35ffb667717df4/collection-address/${collectionAddress}`);
  }
  public async getAccountCollectionNFTs(collectionAddress:string) : Promise<WalletNFT[]>{
    let signers = await this.getConnectedAccounts();
    console.log('get account nfts -- signers', signers[0]);
    let assets = await firstValueFrom(this.http.get<any>(`${this._baseUrl}/blockchain/wallet-nfts/${signers[0]}/collection-address/${collectionAddress.toLocaleLowerCase()}`));
    console.log('get account nfts -- assets', assets);
    return assets;
  }

  public decodeHexString(value: string) : string {
    return this.web3.utils.hexToAscii(value);
  }

  public redeemCustomCharNFT(contract:string, metaUri: string){
    return this.getCustomCharactersContract(contract).methods.redeemNFT(metaUri).send({from: this.connectedWallet, gas:'7000000' })
  }
  // private _mapWalletNFT(item:any): WalletNFT{
  //   let asset: WalletNFT = item;
  //   console.log('-- mapping wallet nft --', asset);
  //   if(asset.metadata){
  //     let decryptedProfile: CharacterProfile = JSON.parse(Decrypter(item.metadata.encryptedProfile));
  //     console.log('-- decrypted profile --', decryptedProfile);
  //     asset.metadata.profile = decryptedProfile;
  //   }
  //   return asset;
  // }

  public getMockedNFTs(): CharacterProfileMock[]{
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
