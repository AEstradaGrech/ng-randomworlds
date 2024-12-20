import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent implements OnInit {
  
  private _smartContractsService = inject(SmartContractsService)
  private _router:Router = inject(Router)
  ngOnInit(): void {
    console.log(`-- game type ${localStorage.getItem('game-type')} --`)
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
    console.log(`-- selected char -- ${name}`)
    localStorage.setItem('selected-char', name)
    this._router.navigateByUrl('randomworlds/world/generator')
    // navigate to WorldGenerator
  }
}
