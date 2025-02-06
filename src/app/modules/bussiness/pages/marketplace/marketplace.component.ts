import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { CatalogueCollection, CatalogueModel, ModelInfo } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent implements OnInit{
  private _smartContractsService = inject(SmartContractsService);

  public modelsCatalogue: CatalogueModel[] = [];
  ngOnInit(): void {
    this._smartContractsService.collections.forEach(item => {
      this._smartContractsService.getCollectionSummary(item.contractAddress).then(summary => {
        console.log('summary', summary);
        summary.models.forEach(model => {
          this._smartContractsService.getModelInfo(model, item.contractAddress).then(modelInfo => {
            console.log('-- model info --', modelInfo);
            modelInfo.price = parseFloat(web3.utils.fromWei(modelInfo.price.toString(), 'ether'));
            let imageUrl = `${summary.gateway}/${summary.modelsCid}/${modelInfo.fileName}${modelInfo.fileExtension}`;
            let catalogueModel: CatalogueModel = {
              ...modelInfo,
              imageUrl: imageUrl,
              collectionSymbol: item.symbol,
              collectionImage: `url(${item.logoImage})`,
              contractAddress: item.contractAddress,
              modelsCid: summary.modelsCid,
              metadataCid: summary.metaCid
            }
            this.modelsCatalogue.push(catalogueModel);
            console.log('-- on init cats --', this.modelsCatalogue);
          })
        })
      })
    })
  }
  public onCharSelect(name:string){
    console.log('-- on char select --', name);
  }
}
