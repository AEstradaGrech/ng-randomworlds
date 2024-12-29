import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent implements OnInit {
  
  private _smartContractsService = inject(SmartContractsService)
  private _router:Router = inject(Router)
  private _snackBar: MatSnackBar = inject(MatSnackBar)
  ngOnInit(): void {
    let gameData = this._getGameData()
    
    //getMoralisWalletData(localStorage.login.userId)
    //charsData = []
    // walletNFTs.foreach(nft => {
    // if(collections.keys(nft.contractAddress)){
    //    esto no hace falta si contract.getTokenData devuelve ya metadataUri
    //    collectionIPFSData = _smarts.getCollectionIPFSData(nft.contractAddres) <- devuelve modelCID and metadataCID
    // }
    //  charsData.push(_smarts.getTokenData(nft.tokenId, nft.collectionAddress) <-- merge variables)
    //})
  }

  public onCharSelect(name:string){
    console.log(`-- selected char -- ${name}`);
    let gameData = this._getGameData();
    if(gameData){
      gameData.charname =name;
      let fakeNFT = this._smartContractsService.getMockedNFTs()[0];
      console.log('-- getting fake nft --', fakeNFT);
      gameData.charTokenId = fakeNFT.id;
      gameData.charCollectionAddress = '0xBLAHBLAH';
      gameData.userPreferences["ambiences"] = fakeNFT.ambiences;
      gameData.userPreferences["moods"] = fakeNFT.moods;
      gameData.charInfo = '';//nftMetadata
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
}
