import { Component, inject, OnInit, ViewChild, Inject, ElementRef, TemplateRef, signal, HostListener } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary, CatalogueModel, CustomCharsCatalogue, CustomCharsCollection, NftDetailModel, WalletNFT } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
import { GameData, NftCardClickAction, RoundedButtonConfig, ScrollState } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router';
import { Wallet } from 'web3';
import { EAppButtons, ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { defaultNftCardButtons } from 'src/app/core/constants/configs/nft-card';
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
  public collections:AssetsCollectionSummary[]=[];
  public customCharsCollection!: CustomCharsCollection | null;
  public loading:boolean = false;
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  private _dialog:MatDialog = inject(MatDialog);
  private _router:Router = inject(Router);


  @ViewChild('nftsContainer') nftsContainer!: ElementRef;
  private _notificationService: NotificationService = inject(NotificationService);
  constructor(@Inject(DOCUMENT) private document:Document){
    super();
  }
  // @HostListener('user-login', ['$event'])
  // public onLoginChange()
  ngOnInit(): void {
    this._getCharactersData();
    this._smartContractsService.onAccountChanged.subscribe(newAddress => {
      this._getCharactersData();
      this._notificationService.openSnack(ESnackAlertType.WARN, `Refreshing view for address: ${newAddress}`);
    })
    this._notificationsService.setup('center', 'bottom', 3000);
  }
  private _getCharactersData(){
    this.collections = [];
    this.customCharsCollection = null;
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
            let walletAssets: AssetModel[] = [];
            walletNFTs.forEach((nft:WalletNFT) => {
              let asset:AssetModel = {...nft, metadata: nft.metadata, collectionLogoUrl: `url(${assetsSummary.logoImage})`}
              walletAssets.push(asset);
            })
            this.assets.update(x => [...walletAssets]);
          }) 
        })
      })
    })
    this._smartContractsService.getCustomCharsCatalogue().then(cats => {
      if(cats.length > 0) {
        this.customCharsCollection = {...cats.slice(-1)[0], assets:[]};
        this._getCustomCharacters();
      }
    });
  }
  private _getCustomCharacters(){
    if(this.customCharsCollection){
      this._smartContractsService.getAccountCollectionNFTs(this.customCharsCollection.contractAddress)
        .then(walletNFTs => {
          console.log('-- on col wallet resp --', walletNFTs);
          if(this.customCharsCollection){
            this.customCharsCollection.assets = walletNFTs.map((nft:any) => {
            let asset:AssetModel = {...nft, collectionLogoUrl: `url('assets/images/MetaMaskIconBrown.png')`}
            return asset;
          });
          this.assets.update(x => [...this.assets(), ...this.customCharsCollection?.assets ?? []]);
          }
        })
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
      let collection = this.collections.filter(x => x.contractAddress.toLowerCase() === model.contractAddress.toLowerCase())[0]
      if(collection){
        let fileName = model.image.split('/').slice(-1)[0].replace('.png','');
        let modelInfo = await this._smartContractsService.getModelInfo(fileName, collection.contractAddress);
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
    else this._notificationService.push('No Game Data has been found in memory, go back to the home page')
  }
}
