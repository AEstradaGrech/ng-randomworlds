import { Component, inject, OnInit, ViewChild, Inject, ElementRef, TemplateRef } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary, CatalogueModel, WalletNFT } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
import { GameData, NftCardClickAction, RoundedButtonConfig, ScrollState } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router';
import { Wallet } from 'web3';
import { EAppButtons } from 'src/app/modules/shared/models/common-enums';
import { defaultNftCardButtons } from 'src/app/core/constants/configs/nft-card';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent implements OnInit {
  
  @ViewChild('sellButton') sellButton!: TemplateRef<any>;
  
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  public assets: AssetModel[] = [];
  public collections:AssetsCollectionSummary[]=[];
  public loading:boolean = false;
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  private _dialog:MatDialog = inject(MatDialog);
  private _router:Router = inject(Router);
  private _slideScrollState: ScrollState = {
    step: 100,
    mult: 1,
    direction:'',
    isScrolling:false
  }
  private _clickScrollState: ScrollState = {
    step: 100,
    mult: 10,
    direction:'',
    isScrolling:false
  }

  @ViewChild('nftsContainer') nftsContainer!: ElementRef;

  constructor(@Inject(DOCUMENT) private document:Document){}

  ngOnInit(): void {
    this._smartContractsService.getCollectionsCatalogue().then(cat => {
      cat.forEach(item => {
        this._smartContractsService.getCollectionSummary(item.contractAddress).then(summary => {
          console.log('summary', summary);
          let assetsSummary:AssetsCollectionSummary ={
            contractAddress: item.contractAddress,
            name: summary.collectionName,
            tokenName: summary.name,
            symbol: item.symbol,
            description: item.description,
            isFree: item.isFree,
            isLimited: item.isLimited,
            isOutOfStock: summary.isOutOfStock,
            models: summary.models,
            mints: summary.totalMints,
            maxMints: summary.maxMints,
            modelsCid: summary.modelsCid,
            metaCid: summary.metaCid,
            logoImage: item.logoImage
          }
          this.collections.push(assetsSummary);
          this._smartContractsService.getAccountCollectionNFTs(item.contractAddress).then(walletNFTs => {
            console.log('-- on col wallet resp --', walletNFTs)
            walletNFTs.forEach((nft:WalletNFT) => {
              let asset:AssetModel = {...nft, metadata: nft.metadata, collectionLogoUrl: `url(${assetsSummary.logoImage})`}
              this.assets.push(asset);
            })
            console.log('-- on assets --', this.assets);
          }) 
        })
      })
    })
  }
  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:WalletNFT){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.contractAddress}/${model.tokenId}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    console.log('-- on view click',model);
    let collection = this.collections.filter(x => x.contractAddress.toLowerCase() === model.contractAddress.toLowerCase())[0]
    if(collection){
      let fileName = model.image.split('/').slice(-1)[0].replace('.png','');
      let modelInfo = await this._smartContractsService.getModelInfo(fileName, collection.contractAddress);
      let catModel:CatalogueModel = {
        collectionDescription: collection.description,
        collectionName:collection.name,
        collectionSymbol: collection.symbol,
        contractAddress: collection.contractAddress,
        logoUrl:collection.logoImage,
        paymentTokens:[],
        fileName:modelInfo.fileName,
        fileExtension:modelInfo.fileExtension,
        available:modelInfo.available,
        mints:modelInfo.mints,
        maxMints:modelInfo.maxMints,
        metadata: model.metadata,
        description:model.metadata.description,
        price: parseFloat(web3(this.document)?.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
        name:model.metadata.name,
        imageUrl:model.image,
        collectionUrl: collection.logoImage
      }
      let cfg = new MatDialogConfig();
      cfg.data = {model:catModel, showContractData:false}
      cfg.height = '90vh';
      cfg.width = '1100px';
      this._dialog.open(CharDetailDialogComponent, cfg);
    }
  }

  public onCardButtonClicked(event:NftCardClickAction){
    console.log('-- char selection >> card btn clicked --', event)
    switch(event.name){
      case('view'):
        this.onViewClick(event.asset);
      break;
      case('select'):
        this.onSelectClick(event.asset);
      break;
      default: break;
    }
  }
  public onSelectClick(model:AssetModel){
    console.log('-- on select click --', model);
    let data = localStorage.getItem('game-data');
    if(data){
      let gameData:GameData = JSON.parse(data);
      gameData.selectedCharacter = model;
      localStorage.setItem('game-data', JSON.stringify(gameData));
      this._router.navigateByUrl('randomworlds/world/generator')
    }

  }
}
