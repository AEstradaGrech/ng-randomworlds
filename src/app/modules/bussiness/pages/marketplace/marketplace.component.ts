import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { CatalogueCollection, CatalogueModel, ModelInfo } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from './char-detail-dialog/char-detail-dialog.component';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent implements OnInit{
  private _smartContractsService = inject(SmartContractsService);
  private _dialog:MatDialog = inject(MatDialog);
  public modelsCatalogue: CatalogueModel[] = [];
  ngOnInit(): void {
    this._smartContractsService.collections.forEach(item => {
      this._smartContractsService.getCollectionSummary(item.contractAddress).then(summary => {
        console.log('summary', summary);
        summary.models.forEach(model => {
          this._smartContractsService.getModelInfo(model, item.contractAddress).then(modelInfo => {
            console.log('-- model info --', modelInfo);
            modelInfo.price = parseFloat(web3.utils.fromWei(modelInfo.price.toString(), 'ether'));
            let catalogueModel: CatalogueModel = {
              ...modelInfo,
              imageUrl: `${summary.gateway}/${summary.modelsCid}/${modelInfo.fileName}${modelInfo.fileExtension}`,
              metadataUrl:`${summary.gateway}/${summary.metaCid}/${modelInfo.fileName}.json`,
              collectionSymbol: item.symbol,
              logoUrl: `url(${item.logoImage})`,
              collectionUrl: item.logoImage,
              contractAddress: item.contractAddress,
              collectionName: item.name,
              collectionDescription:item.description
            }
            this.modelsCatalogue.push(catalogueModel);
            console.log('-- on init cats --', this.modelsCatalogue);
          })
        })
      })
    })
  }
  public onCharSelect(model:CatalogueModel){
    console.log('-- on char select --', model);
    let cfg = new MatDialogConfig();
    cfg.data = model;
    cfg.height = '95vh';
    cfg.width = '1100px';
    this._dialog.open(CharDetailDialogComponent, cfg)
  }
}
