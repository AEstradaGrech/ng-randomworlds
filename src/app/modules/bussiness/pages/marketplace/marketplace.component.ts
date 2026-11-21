import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { CatalogueModel, CharacterMetadata, CharacterProfile, CollectionSummary, ModelInfo, TokenDetails } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent, CHAR_DETAIL_DIALOG_SIZE } from '../char-detail-dialog/char-detail-dialog.component';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoundedButtonConfig } from 'src/app/modules/shared/models/common-interfaces';
import { marketplaceNftCardButtons, replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { Router } from '@angular/router';
import { catchError, defer, EMPTY, from, map, mergeMap, Observable, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent extends BaseComponent implements OnInit{

  public nftCardButtonsConfig = marketplaceNftCardButtons;
  private _smartContractsService = inject(SmartContractsService);
  private _dialog:MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  public modelsCatalogue: CatalogueModel[] = [];
  public loading:boolean = false;
  public selectedToken:string = 'ETH';
  public selectedPrice:string = '--'
  private _paymentTokens: Map<string,TokenDetails> = new Map<string, TokenDetails>();
  private _router:Router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    defer(() => this._smartContractsService.getCollectionsCatalogue())
    .pipe(
      switchMap(addresses => from(addresses)),
      mergeMap(address => {
        return this._setupCollection(address)
          .pipe( 
            catchError(error => {
              this._notificationsService.push(error.message);
              return EMPTY;
            })
          )
      }),
      takeUntilDestroyed(this._destroyRef)
    )
    .subscribe({
      next: model => this.modelsCatalogue.push(model),
      error: error => this._notificationsService.push(`An error has occured while setting up the catalogue models: ${error.message}`)
    });
  }

  public onCharSelect(model:CatalogueModel){
    let cfg = new MatDialogConfig();
    cfg.data = {model:model, showContractData:true}
    Object.assign(cfg, CHAR_DETAIL_DIALOG_SIZE);
    this._dialog.open(CharDetailDialogComponent, cfg)
  }

  public onTokenSelect(change:MatRadioChange, model:CatalogueModel){
    this._updateSelectedPrice(change.value, model);
  }

  public onBuyClick(model:CatalogueModel){
    this._updateSelectedPrice(this.selectedToken, model);
  }

  public async onPayClick(model:CatalogueModel){
    const account = this._smartContractsService.connectedWallet;
    if(!account){
      this._snackBar.open("No connected wallet found, redirecting to login", undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      setTimeout(() => this._router.navigateByUrl('/auth/login'), 2000);
      return;
    }
    this.loading = true;  
    if(this.selectedToken !== 'ETH'){
      let tokenDetails = this._paymentTokens.get(this.selectedToken);
      console.log('--payment token details--', tokenDetails);
      if(tokenDetails){
        let weiPrice = parseInt(this._convertToWei(model.price.toString(), tokenDetails.decimals));
        try{
          await this._smartContractsService.getCoinContract(this.selectedToken).methods
            .approve(model.contractAddress, weiPrice * tokenDetails.multiplier)
            .send({from: account});
          
          await this._smartContractsService.getCollectionContract(model.contractAddress).methods
            .customTokenMint(account, model.fileName, this.selectedToken)
            .send({from:account, gas:'7000000'});
        }catch(error){
          console.log(error)
        }
      }
      else this._snackBar.open(`No token details found for token ${this.selectedToken}`, undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
    }
    else{
      if(await this._smartContractsService.etherMintCharacter(model.contractAddress, model.fileName, model.price, account)){
        this._snackBar.open("Thanks for buying!", undefined, { duration: 2500,panelClass: ['snack-success'], verticalPosition: 'bottom'})
      }
      else{
        this._snackBar.open("An error has occured while minting the NFT, try again later...", undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      }
    }
    this.loading = false;
  }

  private _setupCollection(address: string): Observable<CatalogueModel>{
    let collectionSummary: CollectionSummary;
    return defer(() => this._smartContractsService.getCollectionSummary(address))
        .pipe(
          catchError(error => { throw new Error(`An error has occured while retrieving the collection summary for contract ${address}: ${error.message} `);}),
          tap(summary => collectionSummary = summary),
          switchMap(summary => from(summary.models)),
          mergeMap(model => {
            return this._setupCatalogueModel(collectionSummary, model)
              .pipe( 
                catchError(error => {
                  this._notificationsService.push(error.message);
                  return EMPTY;
                })
              )
          })
        )
  }

  private _setupCatalogueModel(summary:CollectionSummary, model: string) : Observable<CatalogueModel>{
    return defer(() => this._smartContractsService.getModelInfo(model, summary.address))
    .pipe(
      catchError(error => { throw new Error(`An error has occured while getting the model info for ${model} from contract ${summary.address}: ${error.message}`);}),
      map(info => {
          info.price = parseFloat(web3.utils.fromWei(info.price.toString(), 'ether'));
          return info;
      }),
      switchMap(info => this._setupModelMetadata(summary, info))
    )
  }

  private _setupModelMetadata(summary: CollectionSummary, modelInfo: ModelInfo) : Observable<CatalogueModel>{
    return defer(() => this._smartContractsService.withTimeout<CharacterMetadata>(24000, this._smartContractsService.getCharacterMetadata(`${summary.gateway}/${summary.metaCid}/${modelInfo.fileName}.json`)))
      .pipe(
        catchError(error => { throw new Error(`An error has occured while setting the metadata for model ${modelInfo.name} of contract ${summary.address}: ${error.message}`)}),
        map(metadata => {
          let catalogueModel: CatalogueModel = {
              ...modelInfo,
              imageEndpoint: replaceEndpoint(`${summary.gateway}/${summary.modelsCid}/${modelInfo.fileName}${modelInfo.fileExtension}`, 'IPFS', 'ALCHEMY'),
              metadata: metadata,
              collectionSymbol: summary.symbol,
              logoUrl: `url(${replaceEndpoint(summary.logoImage, 'IPFS', 'ALCHEMY')})`,
              collectionUrl: summary.logoImage,
              contractAddress: summary.address,
              collectionName: summary.name,
              collectionDescription:summary.description,
              paymentTokens: ['ETH']
            }
            return catalogueModel;
        })
      )
  }

  
  private _updateSelectedPrice(selectedToken:string, model: CatalogueModel){
    if(selectedToken !== 'ETH'){
      let tokenDetails = this._paymentTokens.get(selectedToken);
      this.selectedPrice = tokenDetails ? `${model.price * tokenDetails.multiplier}` : '--'
    }
    else this.selectedPrice = `${model.price}`;
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
