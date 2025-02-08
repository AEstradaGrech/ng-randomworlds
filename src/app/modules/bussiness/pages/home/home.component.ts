import { Component, Inject, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { DOCUMENT } from '@angular/common';
import web3 from 'src/app/core/scripts/web3'
import { SmartContractsService } from '../../services/smart-contracts.service';


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
  private _smartContractsService = inject(SmartContractsService)
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
