import { EventEmitter, inject, Inject, Injectable, NgZone } from '@angular/core';
import { CharacterProfileMock } from 'src/app/core/interfaces/business/prompting.interface';
import { DOCUMENT } from '@angular/common';
import Web3Provider from 'src/app/core/scripts/web3';
import Kaka from 'src/app/core/scripts/kakaCoin';
import Crap from 'src/app/core/scripts/crapCoin';
import WordsCoin from 'src/app/core/scripts/wordsCoin';
import Web3 from 'web3';
import Factory from 'src/app/core/scripts/immutableFactory';
import Collection from 'src/app/core/scripts/immutableCollection';
import RagCharsCollection from 'src/app/core/scripts/ragCharsCollection';
import CustomChars from 'src/app/core/scripts/customCharacters';
import CustomCharsFactory from 'src/app/core/scripts/customCharsFactory';
import { firstValueFrom, Observable } from 'rxjs';
import { CustomCharsCatalogue, CollectionSummary, ModelInfo, TokenDetails, WalletNFT, CharacterMetadata, CharacterProfile } from 'src/app/core/interfaces/business/smart-contract.interface';
import { HttpClient } from '@angular/common/http';
import { GameData, UserLogin } from '../../shared/models/common-interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SmartContractsService {
  public web3!:any;
  public factory:any;
  public collectionAddresses: string[] = [];
  public onPaymentReceipt: EventEmitter<any> = new EventEmitter<any>();
  public onPaymentError: EventEmitter<any> = new EventEmitter<any>();
  public onAccountChanged: EventEmitter<string> = new EventEmitter<string>(); 
  public onImmutableCatalogue: EventEmitter<boolean> = new EventEmitter<boolean>();
  private _connectedAccount!:string;
  private _baseUrl:string = 'http://localhost:9000/randomworlds'
  private _router: Router = inject(Router);
  private _ngZone: NgZone = inject(NgZone);
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
        this._router.navigateByUrl('');
        return;
      }
      // despite the cached account, the user can change the account
      // or log in again with another wallet so this event notifies that
      // if no accounts then back to login
      // otherwise updates the login and cached account
      // (it is supposed to be a logged user already)
      // and notifies the change to refresh the catalogue views 
      // to display the new account nfts
      // it also invalidates the current game data to notify other tabs
      // and redirect world generator view to home (delete cached nft data from previous user)
      let window:any = this.document.defaultView;
      if(window && window.ethereum){
        window.web3 = new Web3(window.ethereum);
        /*
          Angular doesn't magically know when to repaint. In a zone-based app, Zone.js monkey-patches the browser's 
          async APIs — setTimeout, addEventListener, fetch/XHR, Promises — so that whenever one of those callbacks finishes, 
          Angular runs a change-detection tick. That patched execution context is the NgZone. 
          "Run CD" is really "a zone turn completed."

          window.ethereum is an EIP-1193 provider — a Node-style EventEmitter with its own .on()/.emit(). 
          It is not the DOM's addEventListener, and Zone.js does not patch it. 
          So MetaMask invokes your callback outside the Angular zone.

          Everything downstream inherits that context — the onAccountChanged.emit, the component's .subscribe, _getAccountAssets(), 
          and every displayedAssets.set(...). The signal does update but no zone turn completes

          The view sits on stale content until you click a button (a real DOM click, which is zone-patched) and 
          that unrelated event drives the CD pass that finally flushes your already-updated signal
        */
        window.ethereum.on('accountsChanged', (accounts: any) => {
          //ngZone.run(fn) executes fn inside the Angular zone, so when it returns, a zone turn completes and CD fires.
          this._ngZone.run(() => {
            if (accounts.length === 0) {
              this._router.navigateByUrl('');
            } else {
              console.log('New active account:', accounts[0]);
              this._connectedAccount = accounts[0];
              let login:UserLogin = {
                provider:'metamask',
                username:this._connectedAccount
              }
              localStorage.setItem('user-login', JSON.stringify(login));
              let data: GameData ={
                username: login.username,
                gameType:'',
                gameStatus: "READY",
                charname:'',
                selectedCharacter:undefined,
                character:undefined,
                isRandomCharacter:false,
                gameSessionId:'',
                userPreferences:undefined,
                intro:"",
                currentBlock:0,
                isLocked: false
              };
              localStorage.setItem('game-data', JSON.stringify(data))
              localStorage.setItem('game-data', JSON.stringify(data));
              this.onAccountChanged.emit(this._connectedAccount);
            }
          })
        });
      }
      // If the service loads and the connected account is not
      // the cached account, try login again
      if(res[0] !== this._connectedAccount){
        this.tryMetamaskLogin().then(result => {
          if(!result){
            this._router.navigateByUrl('');
          }
        })
      }
      this._connectedAccount = res[0];
      console.log('-- smart contracts service :: connected account', this._connectedAccount);
    })
    this.getCollectionsCatalogue().then(res => {
      console.log('--contract address--',this.factory._address)
      this.collectionAddresses = res;
      console.log('-- factory cats --', this.collectionAddresses);
      this.onImmutableCatalogue.emit(true);
    })
  }
  
  public async tryMetamaskLogin() : Promise<boolean>{
    try{
      let window:any = this.document.defaultView;
      if(!window) return false;
      if(!window.ethereum) return false;
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      let accounts = await window.web3.eth.getAccounts()
      if(accounts.length <= 0){
        console.log('-- no accounts connected with MetaMask browser extension --');
        return false;
      }
      this._connectedAccount = accounts[0];
      let login:UserLogin = {
        provider:'metamask',
        username:this._connectedAccount
      }
      let currentLogin: UserLogin | undefined = JSON.parse(localStorage.getItem('user-login') ?? '');
      if(currentLogin && currentLogin.username !== this._connectedAccount){
        localStorage.setItem('user-login', JSON.stringify(login));
        this._router.navigateByUrl('randomworlds/home');
        return true;
      }
      localStorage.setItem('user-login', JSON.stringify(login));
      return true;
    }
    catch (error) {
      console.log('on login error', error);
      return false;
    }
  }

  public getWordsContract() : any{
    return WordsCoin(this.web3);
  }
  public getCustomCharactersFactory(): any{
    return CustomCharsFactory(this.web3);
  }
  public async getCustomCharsFactoryOwner(): Promise<string>{
    return await this.getCustomCharactersFactory().methods.owner().call();
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
      case('WORDS'):
        return WordsCoin(this.web3);
      default:break;
    }
    return 
  }

  public async getCurrentChainId() : Promise<number>{
    return await this.web3.eth.net.getId();
  }
  public async getConnectedAccounts() : Promise<any[]>{
    return await this.web3.eth.getAccounts();
  }
  public async getCollectionsCatalogue(): Promise<any[]>{
    return await this.factory.methods.getCatalogue().call();
  }
  public async getCustomCharsCatalogue() : Promise<CustomCharsCatalogue>{
    let cats = await this.getCustomCharactersFactory().methods.getCatalogue().call();
    let current = cats.slice(-1)[0];
    return await this.getCustomCharsSummary(current[0]);
  }
  public async getCustomCharsSummary(address: string): Promise<CustomCharsCatalogue>{
    let contract = this.getCustomCharactersContract(address);
    let name = await contract.methods.name().call();
    let symbol = await contract.methods.symbol().call();
    let weiPrice = await contract.methods.weiMintPrice().call();
    let summary: CustomCharsCatalogue = {
      contractAddress: address,
      name: name,
      symbol: symbol,
      weiMintPrice: BigInt(weiPrice)
    };
    return summary
  }
  public async getCollectionSummary(address: string): Promise<CollectionSummary>{
    let collection = await this.getCollectionContract(address);
    let owner = await collection.methods.owner().call();
    let tokenName = await collection.methods.name().call();
    let symbol = await collection.methods.symbol().call();
    let imagesCid = await collection.methods.modelsFolderCID().call();
    let metadataCid = await collection.methods.metadataFolderCID().call();
    let description = await collection.methods.collectionDescription().call();
    let name = await collection.methods.collectionName().call();
    let endpoint = await collection.methods.endpoint().call();
    let logoEndpoint = await collection.methods.logoEndpoint().call();
    let isLimited = await collection.methods.isLimited().call();
    let maxMints = await collection.methods.maxMints().call();
    let currentTokenId = await collection.methods.tokenId().call();
    let isOutOfStock = await collection.methods.isOutOfStock().call();
    let defaultWeiPrice = await collection.methods.defaultWeiPrice().call();
    let models = await collection.methods.models().call();
    let summary:CollectionSummary = {
      owner: owner,
      address: address,
      name: name,
      symbol: symbol,
      tokenName: tokenName,
      description: description,
      isFreeCollection: parseInt(defaultWeiPrice) > 0,
      isLimitedCollection: isLimited,
      isOutOfStock: isOutOfStock,
      maxMints: parseInt(maxMints),
      totalMints: parseInt(currentTokenId),
      models: models,
      modelsCid: imagesCid,
      metaCid: metadataCid,
      gateway:endpoint,
      logoImage: logoEndpoint
    }
    return summary;
  }  

  public async getEnabledTokens(collectionAddress:string, isCollectionContract: boolean) : Promise<string[]>{
    return isCollectionContract ?
      this.getCollectionContract(collectionAddress).methods.getEnabledTokens().call() :
      this.getCustomCharactersContract(collectionAddress).methods.enabledTokens().call();
  }

  public async getWordsTokenAddress(collectionAddress:string, isCollectionContract: boolean) : Promise<string>{
    return isCollectionContract ?
      this.getCollectionContract(collectionAddress).methods.wordsToken().call() :
      this.getCustomCharactersContract(collectionAddress).methods.wordsToken().call();
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

  public getIpfsMetadata(metaUri:string) : Observable<any>{
    return this.http.get<any>(metaUri);
  }
  public decryptCharacterMetadata(cypher: string) : Observable<CharacterProfile>{
    return this.http.get<CharacterProfile>(`${this._baseUrl}/blockchain/character/decrypt/${cypher}`);
  }
  
  public async withTimeout<T>(timeout: number, promise: Promise<T | void>): Promise<T>{
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Promise timed out')), timeout));
    
      return await Promise.race([promise, timeoutPromise]) as Promise<T>;
  }
  public async getCharacterMetadata(metaUri: string): Promise<CharacterMetadata>{
    let metadata = await firstValueFrom(this.http.get<any>(metaUri));
    let profile = await firstValueFrom(this.http.get<CharacterProfile>(`${this._baseUrl}/blockchain/character/decrypt/${metadata.encrypted_profile}`))
    let charMeta:CharacterMetadata = {
      name: metadata.name,
      description: metadata.description,
      image:metadata.image,
      profile: profile,
      attributes: metadata.attributtes
    };
    return charMeta;
  }

  public async etherMintCharacter(contractAddress:string, model: string, price:number, collectorAddress: string) : Promise<boolean>{
    try{
      let accounts = await this.getConnectedAccounts();
      let weiPrice = Web3.utils.toWei(price.toString(), 'ether');
      await this.getCollectionContract(contractAddress).methods.etherMint(collectorAddress, model)
        .send({from: accounts[0], value: BigInt(weiPrice)})
        .on('receipt', (receipt:any) => {
          console.log('-- on etherMint receipt --', receipt);
          this.onPaymentReceipt.emit(receipt);
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
      await this.getCustomCharactersContract(contractAddress).methods.etherPurchase()
        .send({from: this.connectedWallet, value: Web3.utils.toWei(price, 'ether')})
        .on('receipt', (receipt:any) => {
          console.log('-- on etherMint receipt --', receipt);
          this.onPaymentReceipt.emit(receipt);
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
    return await this.http.get<any>(`${this._baseUrl}/wallet-nfts/${address}`)
  }

  public async getWalletCollectionNFTs(address:string, collectionAddress:string) : Promise<any>{
    return await firstValueFrom(this.http.get<any>(`${this._baseUrl}/blockchain/wallet-nfts/${address}/collection-address/${collectionAddress}`));
  }

  public getWalletNFTsObservable(collectionAddress:string) : Observable<WalletNFT[]>{
    return this.http.get<any>(`${this._baseUrl}/blockchain/wallet-nfts/0xee6870759cbddfb12ee3a4547c35ffb667717df4/collection-address/${collectionAddress}`);
  }

  public async getAccountCollectionNFTs(collectionAddress:string) : Promise<WalletNFT[]>{
    return await firstValueFrom(this.http.get<any>(`${this._baseUrl}/blockchain/wallet-nfts/${this._connectedAccount}/collection-address/${collectionAddress.toLocaleLowerCase()}`));
  }

  public decodeHexString(value: string) : string {
    return this.web3.utils.hexToAscii(value);
  }

  public redeemCustomCharNFT(contract:string, metaUri: string, mintSignature: string){
    return this.getCustomCharactersContract(contract).methods.redeemNFT(metaUri, mintSignature).send({from: this.connectedWallet, gas:'7000000' })
  }

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
