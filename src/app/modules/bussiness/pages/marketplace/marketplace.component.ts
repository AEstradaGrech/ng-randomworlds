import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { CatalogueCollection, CatalogueModel, CollectionSummary, ModelInfo, TokenDetails } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';
import Web3Provider from 'src/app/core/scripts/web3';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from './char-detail-dialog/char-detail-dialog.component';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent implements OnInit{
  private _smartContractsService = inject(SmartContractsService);
  private _dialog:MatDialog = inject(MatDialog);
  public modelsCatalogue: CatalogueModel[] = [];
  public selectedToken:string = 'ETH';
  public selectedPrice:string = '--'
  private _paymentTokens: Map<string,TokenDetails> = new Map<string, TokenDetails>();
  ngOnInit(): void {
    this._smartContractsService.collections.forEach(item => {
      this._smartContractsService.getCollectionSummary(item.contractAddress).then(summary => {
        console.log('summary', summary);
        this._smartContractsService.getEnabledTokens(item.contractAddress).then(response => {
          response.forEach(token => this._cachePaymentTokenDetails(item.contractAddress, token));
          this._setupCatalogueModels({...item, ...summary, enabledTokens:response});
        })
      })
    })
  }
  public onCharSelect(model:CatalogueModel){
    console.log('-- on char select --', model);
    let cfg = new MatDialogConfig();
    cfg.data = model;
    cfg.height = '90vh';
    cfg.width = '1100px';
    this._dialog.open(CharDetailDialogComponent, cfg)
  }
  public onTokenSelect(change:MatRadioChange, model:CatalogueModel){
    console.log(change);
    this._updateSelectedPrice(change.value, model);
  }
  private _updateSelectedPrice(selectedToken:string, model: CatalogueModel){
    if(selectedToken !== 'ETH'){
      let tokenDetails = this._paymentTokens.get(selectedToken);
      this.selectedPrice = tokenDetails ? `${model.price * tokenDetails.multiplier}` : '--'
    }
    else this.selectedPrice = `${model.price}`;
  }
  public onBuyClick(model:CatalogueModel){
    this._updateSelectedPrice(this.selectedToken, model);
  }
  public async onPayClick(model:CatalogueModel){
    console.log('--on buy model--', model);
    console.log('--selected token--', this.selectedToken);
    if(this.selectedToken !== 'ETH'){
      let tokenDetails = this._paymentTokens.get(this.selectedToken);
      console.log('--payment token details--', tokenDetails);
      if(tokenDetails){
       try{

       }catch(error){
        console.log(error);
       }
        
    
      }
      else console.log('-- no token details found for selected token --', this.selectedToken);
    }
    else{
      let connectedAccounts = await this._smartContractsService.getConnectedAccounts();
      console.log('-- ether mint from account --', connectedAccounts[0]);
      await this._smartContractsService.etherMintCharacter(model.contractAddress, model.fileName, model.price, connectedAccounts[0])
    }
  }
  private _cachePaymentTokenDetails(collectionAddress: string, tokenSymbol: string){
    this._smartContractsService.getTokenDetails(collectionAddress, tokenSymbol).then(details => {
      this._paymentTokens.set(tokenSymbol, details);
    })
  }
  private _setupCatalogueModels(summary:any){
    summary.models.forEach((model:string) => {
      this._smartContractsService.getModelInfo(model, summary.contractAddress).then(modelInfo => {
        console.log('-- model info --', modelInfo);
        modelInfo.price = parseFloat(web3.utils.fromWei(modelInfo.price.toString(), 'ether'));
        let catalogueModel: CatalogueModel = {
          ...modelInfo,
          imageUrl: `${summary.gateway}/${summary.modelsCid}/${modelInfo.fileName}${modelInfo.fileExtension}`,
          metadataUrl:`${summary.gateway}/${summary.metaCid}/${modelInfo.fileName}.json`,
          collectionSymbol: summary.symbol,
          logoUrl: `url(${summary.logoImage})`,
          collectionUrl: summary.logoImage,
          contractAddress: summary.contractAddress,
          collectionName: summary.name,
          collectionDescription:summary.description,
          paymentTokens: ['ETH', ...summary.enabledTokens]
        }
        this.modelsCatalogue.push(catalogueModel);
        console.log('-- on init cats --', this.modelsCatalogue);
      })
    })
  }
}
