import { Component, inject, OnInit } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { CatalogueModel, TokenDetails } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent implements OnInit{
  private _smartContractsService = inject(SmartContractsService);
  private _dialog:MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  public modelsCatalogue: CatalogueModel[] = [];
  public loading:boolean = false;
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
    cfg.data = {model:model, showContractData:true}
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
    let connectedAccounts = await this._smartContractsService.getConnectedAccounts();
    console.log('-- ether mint from account --', connectedAccounts[0]);
    this.loading = true;  
    if(this.selectedToken !== 'ETH'){
      let tokenDetails = this._paymentTokens.get(this.selectedToken);
      console.log('--payment token details--', tokenDetails);
      if(tokenDetails){
        let ragWeiPrice = 450000000000000 * tokenDetails.multiplier;
        console.log(`WEI - ${ragWeiPrice}`);
        //console.log(`${this.selectedToken} - ${price}`);

        // if(await this._smartContractsService.mintCharacter(model.contractAddress, this.selectedToken, price, model.fileName, connectedAccounts[0])){
        //   this._snackBar.open("Thanks for buying!", undefined, { duration: 2500,panelClass: ['snack-success'], verticalPosition: 'bottom'})
        // }
        try{
          await this._smartContractsService.getCoinContract(this.selectedToken).methods.approve('0xee6870759cbDdFb12EE3A4547C35FFB667717df4',ragWeiPrice).send({from:'0xee6870759cbDdFb12EE3A4547C35FFB667717df4'})
          await this._smartContractsService.getRagCharsCollectionContract().methods.customTokenMint('0xee6870759cbDdFb12EE3A4547C35FFB667717df4', 'JuniorRagi', this.selectedToken).send({from:'0xee6870759cbDdFb12EE3A4547C35FFB667717df4' ,gas:'7000000'})
          // if(await this._smartContractsService.mintRagChar(this.selectedToken, price, 'JuniorRagi')){
          //   this._snackBar.open("Thanks for buying!", undefined, { duration: 2500,panelClass: ['snack-success'], verticalPosition: 'bottom'})
          // }
          // else this._snackBar.open("An error has occured while minting the NFT, try again later...", undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
        }catch(error){
          console.log(error)
        }
        
      }
      else this._snackBar.open(`No token details found for token ${this.selectedToken}`, undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
    }
    else{
      if(await this._smartContractsService.etherMintCharacter(model.contractAddress, model.fileName, model.price, connectedAccounts[0])){
        this._snackBar.open("Thanks for buying!", undefined, { duration: 2500,panelClass: ['snack-success'], verticalPosition: 'bottom'})
      }
      else{
        this._snackBar.open("An error has occured while minting the NFT, try again later...", undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      }
    }
    this.loading = false;
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
  private _convertToWei(ether:number, tokenDecimals:number){
    switch(tokenDecimals){
        case(3):
            return web3.utils.toWei(ether, 'kwei');
        case(6):
            return web3.utils.toWei(ether, 'mwei');
        case(9):
            return web3.utils.toWei(ether, 'gwei');
        case(12):
            return web3.utils.toWei(ether, 'szabo');
        case(15):
            return web3.utils.toWei(ether, 'finney');
        case(18):
            return web3.utils.toWei(ether, 'ether');
        default: return ether.toString();
    }
  }
}
