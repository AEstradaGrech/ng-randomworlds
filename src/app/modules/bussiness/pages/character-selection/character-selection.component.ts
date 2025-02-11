import { Component, inject, OnInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary, CatalogueModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
import { ScrollState } from 'src/app/modules/shared/models/common-interfaces';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent implements OnInit {
  
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  public assets: AssetModel[] = [];
  public collections:AssetsCollectionSummary[]=[];
  public loading:boolean = false;
  private _dialog:MatDialog = inject(MatDialog);
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

  @ViewChild('sidenav') sidenav!: MatSidenav;
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
            walletNFTs.forEach(nft => {
              this._smartContractsService.getCharacterMetadata(nft.metadataUrl).then(meta => {
                this.assets.push({...nft, metadata: meta});
                this.assets.push({...nft, metadata: meta});
                this.assets.push({...nft, metadata: meta});
              })
            })
          }) 
        })
      })
    })
  }
  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:AssetModel){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.tokenAddress}/${model.id}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    console.log('-- on view click',model);
    let collection = this.collections.filter(x => x.contractAddress.toLowerCase() === model.tokenAddress.toLowerCase())[0]
    if(collection){
      let fileName = model.imageUrl.split('/').slice(-1)[0].replace('.png','');
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
        metadataUrl: model.metadataUrl,
        description:model.description,
        price: parseFloat(web3(this.document)?.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
        name:model.name,
        imageUrl:model.imageUrl,
        collectionUrl: collection.logoImage
      }
      let cfg = new MatDialogConfig();
      cfg.data = {model:catModel, showContractData:false}
      cfg.height = '90vh';
      cfg.width = '1100px';
      this._dialog.open(CharDetailDialogComponent, cfg);
    }
  }
  public onSelectClick(model:AssetModel){
    console.log('-- on sell click --', model);
    
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
  closeSidenav() {
    this.sidenav.close();
  }

  getModelCollectionLogoUrl(model:AssetModel){
    let collection = this.collections.filter(x => x.contractAddress.toLowerCase() === model.tokenAddress.toLowerCase())[0];
    if(collection){
      return `url(${collection.logoImage}`;
    }
    else return `url(assets/images/ng-app-logo.png)` //default logo
  }
}
