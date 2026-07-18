import { Component, signal, inject, OnInit, ViewChild, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary, CatalogueCollection, CatalogueModel, CustomCharsCatalogue, CustomCharsCollection } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
import { GameData, NftCardClickAction, RoundedButtonConfig, ScrollState } from 'src/app/modules/shared/models/common-interfaces';
import { defaultNftCardButtons } from 'src/app/core/constants/configs/nft-card';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { CharacterCreatorDialogComponent } from './components/character-creator-dialog/character-creator-dialog.component';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { ESnackAlertType } from 'src/app/modules/shared/models/common-enums';

/**
 * Signature every handler passed to the #collectionsInfo template must satisfy,
 * so the template can call `open(item)` uniformly regardless of which one it got.
 */
export type CollectionOpenHandler = (item?: unknown) => void;

@Component({
  selector: 'app-assets-view',
  templateUrl: './assets-view.component.html',
  styleUrl: './assets-view.component.scss'
})
export class AssetsViewComponent extends BaseComponent implements OnInit, AfterViewInit {
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  public collections: AssetsCollection[] = []
  public currentCollection!: AssetsCollection;
  public customCharsCollection!: CustomCharsCollection;
  public currentCollectionLogoUrl: any;
  public loading:boolean = false;
  private _dialog:MatDialog = inject(MatDialog);
  public displayedAssets = signal<AssetModel[]>([]);
  public selectedContractAddress = signal<string>('');
  private _visorType:string = 'row';
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

  public get collectionAssets(): AssetModel[]{
    return this.currentCollection ? 
      this.customCharsCollection && this.customCharsCollection.assets ? 
      [...this.currentCollection.assets, ...this.customCharsCollection.assets] : 
      this.currentCollection.assets : [];
  }

  public defaultLogoUrl:string = 'assets/images/MetamaskIconBrown.png';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('nftsContainer') nftsContainer!: ElementRef;

  constructor(@Inject(DOCUMENT) private document:Document) { super();}
  
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
          let collection:AssetsCollection = {summary:assetsSummary, assets:[]};
          this.collections.push(collection);
          if(!this.currentCollection){
            this.currentCollection = this.collections[0];
            this.currentCollectionLogoUrl = `url(${this.currentCollection.summary.logoImage}`;
          }
          this._smartContractsService.getAccountCollectionNFTs(assetsSummary.contractAddress).then(walletNFTs => {
            console.log('-- on col wallet resp --', walletNFTs)
            collection.assets = walletNFTs.map((nft:any) => {
              let asset:AssetModel = {...nft, collectionLogoUrl: `url(${assetsSummary.logoImage})`}
              return asset;
            });
            this.selectCollection(collection);
          })
        })
      })
    });
    this._smartContractsService.getCustomCharsCatalogue().then(cats => {
      if(cats.length > 0) {
        this.customCharsCollection = {...cats.slice(-1)[0], assets:[]};
        this._getCustomCharacters();
      }
    });
    this._notificationsService.setup('center', 'bottom', 3000)
  }
  
  private _getCustomCharacters(){
    if(this.customCharsCollection){
      this._smartContractsService.getAccountCollectionNFTs(this.customCharsCollection.contractAddress)
        .then(walletNFTs => {
          console.log('-- on col wallet resp --', walletNFTs)
          this.customCharsCollection.assets = walletNFTs.map((nft:any) => {
            let asset:AssetModel = {...nft, collectionLogoUrl: `url('assets/images/MetaMaskIconBrown.png')`}
            return asset;
          });
        })
    }
  }

  ngAfterViewInit(): void {
    let wallet = this._smartContractsService.connectedWallet;
    this._notificationsService.openSnack(
      wallet ? ESnackAlertType.WARN : ESnackAlertType.ERROR, 
      wallet ? `Connected Wallet Address: ${this._smartContractsService.connectedWallet}` : 'No Wallet connected!');
  }

  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:AssetModel){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.contractAddress}/${model.tokenId}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    console.log('-- on view click',model);
    let collection = this.collections.filter(x => x.summary.contractAddress.toLowerCase() === model.contractAddress.toLowerCase())[0]
    if(collection){
      let fileName = model.image.split('/').slice(-1)[0].replace('.png','');
      let modelInfo = await this._smartContractsService.getModelInfo(fileName, collection.summary.contractAddress);
      let catModel:CatalogueModel = {
        collectionDescription: collection.summary.description,
        collectionName:collection.summary.name,
        collectionSymbol: collection.summary.symbol,
        contractAddress: collection.summary.contractAddress,
        logoUrl:collection.summary.logoImage,
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
        collectionUrl: collection.summary.logoImage
      }
      let cfg = new MatDialogConfig();
      cfg.data = {model:catModel, showContractData:true};
      cfg.height = '90vh';
      cfg.width = '1100px';
      this._dialog.open(CharDetailDialogComponent, cfg);
    }
  }
  public onSellClick(model:AssetModel){
    console.log('-- on sell click --', model)
  }
  public onSlideViewClick(direction: string){
    if(this._slideScrollState.isScrolling) return;
    this._clickScrollState.direction = direction;
    this._clickScrollState.isScrolling = true;
    let currentScroll = this.nftsContainer.nativeElement.scrollLeft;
    let dirMult:number = this._clickScrollState.direction === 'right' ? 1 : -1;
    this.nftsContainer.nativeElement.scrollTo({
      left: currentScroll + this._clickScrollState.step * this._clickScrollState.mult * dirMult,
      behavior: 'smooth'
    })
  }
  public onSlideViewPress(direction: string){
    setTimeout(() => {
      if(this._clickScrollState.isScrolling) return;
      this._slideScrollState.direction = direction;
      this._slideScrollState.isScrolling = true;
      this._scrollVisor();
    }, 90);
  }
  public onSlideViewRelease(){
    setTimeout(()=> {
      this._slideScrollState.direction = '';
      this._slideScrollState.isScrolling = false;
      this._clickScrollState.direction = '';
      this._clickScrollState.isScrolling = false;
    }, 75);
  }
  private _scrollVisor(){
    if(this._slideScrollState.isScrolling && this._slideScrollState.direction){
      let dirMult:number = this._slideScrollState.direction === 'right' ? 1 : -1;
      this.nftsContainer.nativeElement.scrollLeft += this._slideScrollState.step * this._slideScrollState.mult * dirMult;
      setTimeout(() => {this._scrollVisor()}, 50);
    }
  }
  public closeSidenav() {
    this.sidenav.close();
  }

  /*
   * These two are passed BY REFERENCE through the #collectionsInfo template
   * context and invoked from (opened). They are arrow properties, not methods,
   * on purpose: the template calls them off the context object, so a plain
   * method would bind `this` to that context instead of the component.
   * Each call site passes the handler it wants, so no runtime type check.
   */
  public readonly selectCustomCharsCollection: CollectionOpenHandler = () => {
    if(this.customCharsCollection){
      if(this._visorType !== 'row'){
        this.selectedContractAddress.set(this.customCharsCollection.contractAddress);
        return;
      }
      this.displayedAssets.set(this.customCharsCollection.assets);
      this.selectedContractAddress.set(this.customCharsCollection.contractAddress);
    }
  }
  public onVisorTypeChange(visualization: string){
    console.log('new visualization', visualization);
    if(visualization !== 'grid' && visualization !== 'row') return;
    this._visorType = visualization;
    if(visualization === 'grid'){
      let assets: AssetModel[] = [];
      if(this.customCharsCollection && this.customCharsCollection.assets.length > 0){
        assets = [...this.customCharsCollection.assets];
      }
      if(this.collections.length > 0){
        this.collections.forEach(col => assets = [...assets, ...col.assets]);
        this.displayedAssets.set(assets);
      }
    }
    else{
      if(!this.currentCollection && this.collections.length > 0)
        this.collections[0];
      
      if(!this.currentCollection){
        if(this.customCharsCollection)
          this.selectCustomCharsCollection();
      }
      else this.selectCollection(this.currentCollection);
    }
  }
  public readonly selectCollection: CollectionOpenHandler = (item?: unknown) => {
    const collection = item as AssetsCollection;
    if(!collection) return;
    this.currentCollection = this.collections.filter(x => x.summary.contractAddress === collection.summary.contractAddress)[0]
    if(this._visorType === 'row')
      this.displayedAssets.set(this.currentCollection.assets);  
    this.selectedContractAddress.set(this.currentCollection.summary.contractAddress);
  }
  public onCardButtonClicked(event:NftCardClickAction){
    console.log('-- char selection >> card btn clicked --', event)
    switch(event.name){
      case('view'):
        this.onViewClick(event.asset);
      break;
      case('select'):
        console.log('-- on select click --', event.asset);
        let data = localStorage.getItem('game-data');
        if(data){
          let gameData:GameData = JSON.parse(data);
          gameData.selectedCharacter = event.asset;
          localStorage.setItem('game-data', JSON.stringify(gameData));
          this._notificationsService.push(`Selected Character: ${event.asset.metadata.name}`);
          //this._router.navigateByUrl('randomworlds/world/generator')
        }
        else this._notificationsService.push('No Game Data has been found in memory, go back to the home page')
      break;
      default: break;
    }
  }
  public onCreateCharacterClick(){
    console.log('-- on create character click --');
    this._dialog.open(CharacterCreatorDialogComponent, { data: {connectedWallet: this._smartContractsService.connectedWallet }})
      .afterClosed()
      .subscribe(result => {
        if(result){
          this._notificationsService.openSnack(ESnackAlertType.SUCCESS, "On Character Created");
          this._getCustomCharacters();
          //refresh NFTs
        }
    })
  }
}
