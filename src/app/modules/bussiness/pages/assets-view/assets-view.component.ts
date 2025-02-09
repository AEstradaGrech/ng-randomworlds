import { Component, signal, inject, OnInit, ViewChild, Inject } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
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
    //this.document.location.href = `https://sepolia.etherscan.io/token/${address}`;
  }
  public onViewClick(model:AssetModel){
    console.log('-- on view click')
  }
  public onSellClick(model:AssetModel){
    console.log('-- on sell click --', model)
  }
  closeSidenav() {
    this.sidenav.close();
  }

  //--------------------------------------------
  step = signal(0);

  setStep(collection: AssetsCollection) {
    this.currentCollection = this.collections.filter(x => x.summary.contractAddress === collection.summary.contractAddress)[0]
  }

  //--------------------------------------------
}
