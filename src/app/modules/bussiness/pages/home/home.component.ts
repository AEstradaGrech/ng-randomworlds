import { Component, Inject, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { DOCUMENT } from '@angular/common';
import web3 from 'src/app/core/scripts/web3'
import Factory from 'src/app/core/scripts/immutableFactory'
import Collection from 'src/app/core/scripts/immutableCollection'
import Web3 from "web3";
declare let window:any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  imageSource:any
  sanitizer = inject(DomSanitizer)
  imagesService = inject(ImagesService)
  router = inject(Router)
  private _snackBar = inject(MatSnackBar)
  web3provider!:any;
  constructor(@Inject(DOCUMENT) private document: Document){}
  ngOnInit(): void {
    // this.imagesService.getLastWithName("DarkTemplar").subscribe(res => {
    //   this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res.base64}`);
    // })
    //this.loadWeb3();
    this.web3provider = web3(this.document);
    console.log('web3 prov',this.web3provider);
  }
  async loadWeb3() {
    if (window.ethereum) {
        this.web3provider = new Web3(window.ethereum);
        await window.ethereum.enable;
    } else {
      this._snackBar.open("'Non-Ethereum browser detected. You Should consider using MetaMask!'", undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'top'});
    }
  }
  async onBeginClick(gameType:string){
    switch(gameType){
      case('quest'):
        let gameData = localStorage.getItem('game-data')
        if(gameData){
          let object = JSON.parse(gameData)
          if(object.gameType !== 'quest'){
            localStorage.removeItem('game-data') //TODO: Modal 'Warning'
            this._setGameData('quest')
          }
        }else{
          this._setGameData('quest')
          console.log('-- stored game --', localStorage.getItem('game-type'))
        }
        this.router.navigateByUrl('randomworlds/character/select');
        break;
      case('adventure'):
        //https://medium.com/upstate-interactive/how-to-connect-an-angular-application-to-a-smart-contract-using-web3js-f83689fb6909
        let accounts = await this.web3provider.eth.getAccounts();
        console.log('-get accs-', accounts);
        let factoryInstance:any = Factory(this.web3provider);
        console.log('fact inst', factoryInstance);
        let catalogue = await factoryInstance.methods.getCatalogue().call({from:accounts[0]});
        console.log('catalogue', catalogue);
        let devCol = catalogue.filter((x:any) => x.contractAddress === '0x89d336B82232c680F7786e18DC3d766601F061BD')[0];
        console.log('dev col', devCol);
        if(devCol){
          let collection:any = Collection(this.web3provider, devCol.contractAddress);
          let summary = await collection.methods.getContractSummary().call({from: accounts[0]});
          console.log('col summary', summary);
        }
        return;
        localStorage.setItem('game-type', 'adventure')
        this.router.navigateByUrl('randomworlds/character/select');
        break;
      default: 
        this._snackBar.open("An error has occured while trying to begin the game", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      break;
    }
  }

  private _setGameData(gameType:string){
    let login = localStorage.getItem('user-login')
    if(!login) return;
    let creds = JSON.parse(login)
    let data: GameData ={
      username: creds.username,
      gameType:gameType,
      gameStatus: "READY",
      charname:'',
      charTokenId:0,
      charCollectionAddress:'',
      characterMeta:undefined,
      character:undefined,
      isRandomCharacter:false,
      gameSessionId:'',
      userPreferences:undefined,
      intro:"",
      currentBlock:0
    }
    localStorage.setItem('game-data', JSON.stringify(data))
  }
}
