import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { QuestCharacter } from 'src/app/core/interfaces/business/prompting.interface';
@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent implements OnInit {
  
  private _smartContractsService = inject(SmartContractsService)
  private _router:Router = inject(Router)
  private _snackBar: MatSnackBar = inject(MatSnackBar)
  @ViewChild('nftsContainer') nftsContainer!: ElementRef;
  ngOnInit(): void {
    let gameData = this._getGameData()
  }

  public onCharSelect(name:string){
    console.log(`-- selected char -- ${name}`);
    let gameData = this._getGameData();
    if(gameData){
      gameData.charname =name;
      let fakeNFT = this._smartContractsService.getMockedNFTs()[1];
      console.log('-- getting fake nft --', fakeNFT);
      gameData.charTokenId = fakeNFT.id;
      gameData.charCollectionAddress = '0xBLAHBLAH';
      gameData.characterMeta = fakeNFT;//nftMetadata
      gameData.character = {
        name: fakeNFT.name,
        age: fakeNFT.age,
        appereance: fakeNFT.appereance,
        background: fakeNFT.background,
        personality: fakeNFT.personality,
        motivations: fakeNFT.motivations,
        iconicMoment: fakeNFT.iconicMoment,
        comment: fakeNFT.comment
      }
    
      localStorage.setItem('game-data', JSON.stringify(gameData));
      console.log('-- JSON --' , JSON.stringify(gameData))
      this._router.navigateByUrl('randomworlds/world/generator');
    }
    else{
      this._snackBar.open("An error has occured while trying to begin the game...no game data found!", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      this._router.navigateByUrl('randomworlds/home')
    }
    // navigate to WorldGenerator
  }

  private _getGameData():GameData | null{
    let gameDataCache = localStorage.getItem('game-data')
    return gameDataCache ? JSON.parse(gameDataCache) : null;
  }
  public onSkipLeftClick(){
    this.nftsContainer.nativeElement.scrollLeft += 100;
    // let element = this.document.getElementById("nfts-container");
    // if(element)
    //   element.scrollLeft += 100;
  }
}
