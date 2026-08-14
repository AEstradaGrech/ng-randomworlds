import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { CatalogueModel, CharacterMetadata, CharacterProfile, TokenDetails } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoundedButtonConfig } from 'src/app/modules/shared/models/common-interfaces';

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
    this._smartContractsService.getCollectionsCatalogue().then(items => {
      items.forEach(item => {
        this._smartContractsService.getCollectionSummary(item).then(summary => {
          console.log('summary', summary);
          this._setupCatalogueModels(summary);
        })
      })
    });
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
    let connectedAccounts = await this._smartContractsService.getConnectedAccounts();
    console.log('-- ether mint from account --', connectedAccounts[0]);
    this.loading = true;  
    if(this.selectedToken !== 'ETH'){
      let tokenDetails = this._paymentTokens.get(this.selectedToken);
      console.log('--payment token details--', tokenDetails);
      if(tokenDetails){
        let weiPrice = parseInt(this._convertToWei(model.price.toString(), tokenDetails.decimals));
        try{
          await this._smartContractsService.getCoinContract(this.selectedToken).methods
            .approve(model.contractAddress, weiPrice * tokenDetails.multiplier)
            .send({from: this._smartContractsService.connectedWallet});
          
          await this._smartContractsService.getCollectionContract(model.contractAddress).methods
            .customTokenMint(this._smartContractsService.connectedWallet, model.fileName, this.selectedToken)
            .send({from:this._smartContractsService.connectedWallet, gas:'7000000'});
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
  public onCardButtonClicked(event:any){
    console.log('-- on card button click --', event);
  }
  private _setupCatalogueModels(summary:any){
    summary.models.forEach((model:string) => {
      this._smartContractsService.getModelInfo(model, summary.address).then(modelInfo => {
        modelInfo.price = parseFloat(web3.utils.fromWei(modelInfo.price.toString(), 'ether'));
        this._smartContractsService.withTimeout<CharacterMetadata>(24000, this._smartContractsService.getCharacterMetadata(`${summary.gateway}/${summary.metaCid}/${modelInfo.fileName}.json`))
          .then(metadata => {
            let catalogueModel: CatalogueModel = {
              ...modelInfo,
              imageEndpoint: `${summary.gateway}/${summary.modelsCid}/${modelInfo.fileName}${modelInfo.fileExtension}`,
              metadata: metadata,
              collectionSymbol: summary.symbol,
              logoUrl: `url(${summary.logoImage})`,
              collectionUrl: summary.logoImage,
              contractAddress: summary.address,
              collectionName: summary.name,
              collectionDescription:summary.description,
              paymentTokens: ['ETH']
            }
            this.modelsCatalogue.push(catalogueModel);
        })
      })
    })
  }


  private _convertToWei(ether:string, tokenDecimals:number){
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
            return `${web3.utils.toWei(ether, 'ether')}`;
        default: return `${0}`;
    }
  }
}
