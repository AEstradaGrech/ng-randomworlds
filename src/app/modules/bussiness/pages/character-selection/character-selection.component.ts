import { Component, inject, OnInit, ViewChild, Inject, ElementRef, TemplateRef, signal } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, CollectionSummary, CustomCharsCollection, NftDetailModel, WalletNFT } from 'src/app/core/interfaces/business/smart-contract.interface';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
import { GameData, NftCardClickAction, RoundedButtonConfig } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router';
import {ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { defaultNftCardButtons, replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent extends BaseComponent implements OnInit {
  
  @ViewChild('sellButton') sellButton!: TemplateRef<any>;
  
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  public assets = signal<AssetModel[]>([]);
  public collections:CollectionSummary[]=[];
  public customCharsCollection!: CustomCharsCollection | null;
  public loading:boolean = false;
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  private _dialog:MatDialog = inject(MatDialog);
  private _router:Router = inject(Router);


  @ViewChild('nftsContainer') nftsContainer!: ElementRef;

  constructor(@Inject(DOCUMENT) private document:Document){
    super();
  }

  ngOnInit(): void {
    this._getCharactersData();
    this._smartContractsService.onAccountChanged.subscribe(newAddress => {
      this._getCharactersData();
      this._notificationsService.openSnack(ESnackAlertType.WARN, `Refreshing view for address: ${newAddress}`);
    })
    this._notificationsService.setup('center', 'bottom', 3000);
  }
  private async _getCharactersData(){
    this.collections = [];
    this.customCharsCollection = null;
    let cat = await this._smartContractsService.getCollectionsCatalogue();
    if(!cat) return;
    cat.forEach(async address => {
      let summary = await this._smartContractsService.getCollectionSummary(address);
      if(!summary) return;
      this.collections.push(summary);
      let walletNFTs = await this._smartContractsService.getAccountCollectionNFTs(address);
      console.log('-- on col wallet resp --', walletNFTs);
      walletNFTs.forEach(async (nft:WalletNFT) => {
          let isLocked = await this._smartContractsService.isAssetLocked(address, false, nft.tokenId);
          let asset:AssetModel = {...nft, metadata: nft.metadata, isLocked: isLocked, collectionLogoUrl: `url(${replaceEndpoint(summary.logoImage, 'IPFS', 'ALCHEMY')})`}
          if(isLocked){
            asset.lockedUntil = await this._smartContractsService.isLockedUntil(address, false, nft.tokenId);
            let session = await this._smartContractsService.getPlayerSession(address, nft.tokenId);
            asset.isInGame = session && session.startedAt > 0;
            this.assets.update(x => [...this.assets(), asset]);
          }
          else this.assets.update(x => [...this.assets(), asset]);
        });
    });

    
    this._smartContractsService.getCustomCharsCatalogue().then(cat => {
      if(cat) {
        this.customCharsCollection = {...cat, assets:[]};
        this._getCustomCharacters();
      }
    });
  }
  private async _getCustomCharacters(){
    if(this.customCharsCollection){
      let walletNFTs = await this._smartContractsService.getAccountCollectionNFTs(this.customCharsCollection.contractAddress)
      console.log('-- on col wallet resp --', walletNFTs);
      walletNFTs.forEach(async (nft:any) => {
        let isLocked = await this._smartContractsService.isAssetLocked(this.customCharsCollection?.contractAddress ?? '', true, nft.tokenId);
        let asset:AssetModel = {...nft, isLocked: isLocked, collectionLogoUrl: `url('assets/images/MetaMaskIconBrown.png')`};
        if(asset.isLocked){
          asset.lockedUntil = await this._smartContractsService.isLockedUntil(this.customCharsCollection?.contractAddress ?? '', true, asset.tokenId);
          let session = await this._smartContractsService.getPlayerSession(this.customCharsCollection?.contractAddress ?? '', nft.tokenId);
          asset.isInGame = session.startedAt > 0;
          this.customCharsCollection?.assets.push(asset);
        }
        else this.customCharsCollection?.assets.push(asset);
        this.assets.update(x => [...this.assets(), asset]);
      });
    }
  }
  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:WalletNFT){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.contractAddress}/${model.tokenId}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    console.log('-- on view click',model);
    let cfg = new MatDialogConfig();
    cfg.height = '90vh';
    cfg.width = '1100px';
    
    if(!this.customCharsCollection || model.contractAddress !== this.customCharsCollection.contractAddress) {
      let collection = this.collections.filter(x => x.address.toLowerCase() === model.contractAddress.toLowerCase())[0]
      if(collection){
        let fileName = model.image.split('/').slice(-1)[0].replace('.png','');
        let modelInfo = await this._smartContractsService.getModelInfo(fileName, collection.address);
        let catModel:NftDetailModel = {
          name: model.metadata.name,
          metadata: model.metadata,
          imageEndpoint: model.image,
          price: parseFloat(web3(this.document)?.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
          mints:modelInfo.mints,
          maxMints:modelInfo.maxMints,
        }
        cfg.data = {model:catModel, showContractData:false};
      } 
    }
    else{
      let catModel: NftDetailModel ={
          name: model.metadata.name,
          imageEndpoint: model.image,
          metadata: model.metadata,
          price: parseFloat(web3(this.document)?.utils.fromWei(this.customCharsCollection.weiMintPrice.toString(),'ether') ?? '0')
      }
      cfg.data = {model:catModel, showContractData:false};
    }
    this._dialog.open(CharDetailDialogComponent, cfg);
  }

  public onCardButtonClicked(event:NftCardClickAction){
    console.log('-- char selection >> card btn clicked --', event)
    switch(event.name){
      case('view'):
        this.onViewClick(event.asset);
      break;
      case('select'):
        let data = localStorage.getItem('game-data');
        if(data){
          let gameData:GameData =  JSON.parse(data);
          if(gameData && gameData.isLocked){
            this._notificationsService.openSnack(ESnackAlertType.WARN, 'There is a game ongoing in another tab, cannot change the character', true);
            return;
          }
        }
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
    else this._notificationsService.push('No Game Data has been found in memory, go back to the home page')
  }
}
