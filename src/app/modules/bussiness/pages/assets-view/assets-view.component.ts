import { Component, signal, inject, OnInit, ViewChild, Inject } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary, CatalogueModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
@Component({
  selector: 'app-assets-view',
  templateUrl: './assets-view.component.html',
  styleUrl: './assets-view.component.scss'
})
export class AssetsViewComponent implements OnInit {
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  public collections: AssetsCollection[] = []
  public currentCollection!: AssetsCollection;
  public currentCollectionLogoUrl: any;
  public loading:boolean = false;
  private _dialog:MatDialog = inject(MatDialog);
  @ViewChild('sidenav') sidenav!: MatSidenav;
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
          let collection:AssetsCollection = {summary:assetsSummary, assets:[]};
          this.collections.push(collection);
          if(!this.currentCollection){
            this.currentCollection = this.collections[0];
            this.currentCollectionLogoUrl = `url(${this.currentCollection.summary.logoImage}`;
          }
          this._smartContractsService.getAccountCollectionNFTs(assetsSummary.contractAddress).then(walletNFTs => {
            console.log('-- on col wallet resp --', walletNFTs)
            walletNFTs.forEach(nft => {
              this._smartContractsService.getCharacterMetadata(nft.metadataUrl).then(meta => {
                let asset:AssetModel = {...nft, metadata: meta}
                collection.assets.push(asset);
                console.log('-- current collection -- ', this.currentCollection)
              })
            })
          })
        })
        this._smartContractsService.getCollectionSummary(item.contractAddress).then(summary => {
          let mockname = `${summary.collectionName}-mock-1`;
          let mockAddress = item.contractAddress.replace('c70','x00');
          let assetsSummary:AssetsCollectionSummary ={
            contractAddress: mockAddress,
            name: mockname,
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
          console.log('mock summary', summary);
          let collection:AssetsCollection = {summary:assetsSummary, assets:[]};
          this.collections.push(collection);
          if(!this.currentCollection){
            this.currentCollection = this.collections[0];
            this.currentCollectionLogoUrl = `url(${this.currentCollection.summary.logoImage}`;
          }
          this._smartContractsService.getAccountCollectionNFTs(item.contractAddress).then(walletNFTs => {
            console.log('-- on col wallet resp --', walletNFTs)
            walletNFTs.forEach(nft => {
              this._smartContractsService.getCharacterMetadata(nft.metadataUrl).then(meta => {
                let asset:AssetModel = {...nft, metadata: meta}
                collection.assets.push(asset);
                console.log('-- current collection -- ', this.currentCollection)
              })
            })
            walletNFTs.forEach(nft => {
              this._smartContractsService.getCharacterMetadata(nft.metadataUrl).then(meta => {
                let asset:AssetModel = {...nft, metadata: meta}
                collection.assets.push(asset);
                console.log('-- current collection -- ', this.currentCollection)
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
    let collection = this.collections.filter(x => x.summary.contractAddress.toLowerCase() === model.tokenAddress.toLowerCase())[0]
    if(collection){
      let fileName = model.imageUrl.split('/').slice(-1)[0].replace('.png','');
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
        metadataUrl: model.metadataUrl,
        description:model.description,
        price: parseFloat(web3(this.document)?.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
        name:model.name,
        imageUrl:model.imageUrl,
        collectionUrl: collection.summary.logoImage
      }
      let cfg = new MatDialogConfig();
      cfg.data = catModel;
      cfg.height = '90vh';
      cfg.width = '1100px';
      this._dialog.open(CharDetailDialogComponent, cfg);
    }
  }
  public onSellClick(model:AssetModel){
    console.log('-- on sell click --', model)
  }
  closeSidenav() {
    this.sidenav.close();
  }
  selectCollection(collection: AssetsCollection) {
    this.currentCollection = this.collections.filter(x => x.summary.contractAddress === collection.summary.contractAddress)[0]
  }
}
