import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, AssetsCollectionSummary } from 'src/app/core/interfaces/business/smart-contract.interface';

@Component({
  selector: 'app-assets-view',
  templateUrl: './assets-view.component.html',
  styleUrl: './assets-view.component.scss'
})
export class AssetsViewComponent implements OnInit {
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  public collections: AssetsCollection[] = []
  ngOnInit(): void {
    this._smartContractsService.getCollectionsCatalogue().then(cat => {
      cat.forEach(item => {
        this._smartContractsService.getCollectionSummary(item.contractAddress).then(summary => {
          let assetsSummary:AssetsCollectionSummary ={
            contractAddress: item.contractAddress,
            name: item.collectionName,
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
          this._smartContractsService.getAccountCollectionNFTs(assetsSummary.contractAddress).then(walletNFTs => {
            console.log('-- on col wallet resp --', walletNFTs)
            walletNFTs.forEach(nft => {
              this._smartContractsService.getCharacterMetadata(nft.metadataUrl).then(meta => {
                let asset:AssetModel = {...nft, metadata: meta}
                collection.assets.push(asset);
                console.log('-- wallet assets -- ', this.collections)
              })
            })
          })
          // this._smartContractsService.getAccountCollectionNFTs(assetsSummary.contractAddress).then(walletNFTs => {
          //   console.log('-- on col wallet resp --', walletNFTs)
          //   walletNFTs.forEach(nft => {
          //     this._smartContractsService.getCharacterMetadata(nft.metadataUrl).then(meta => {
          //       let asset:AssetModel = {...nft, metadata: meta}
          //       collection.assets.push(asset);
          //       console.log('-- wallet assets -- ', this.collections)
          //     })
          //   })
          // })
        })
      })
    })
  }
  //factory.collection.forEach(catInfo ->{
  // getSummary
  // WalletCollection:{ colSummary, walletAssets <- CatalogueModel. WalletNFT se usa para saber cuales tiene}
  //  getWalletNFTsByCollection(accounts[0], catInfo.contractAddress)
  //  pinto ColBox. Tiene desplegable con visor horizontal
  //})
}
