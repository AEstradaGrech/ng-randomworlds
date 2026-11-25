import { Component, inject, OnInit, ViewChild, Inject, ElementRef, TemplateRef, signal, EventEmitter, DestroyRef, NgZone } from '@angular/core';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, CollectionSummary, CustomCharsCollection, NftDetailModel, WalletNFT } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent, CHAR_DETAIL_DIALOG_SIZE } from '../char-detail-dialog/char-detail-dialog.component';
import { AssetCardButtonState, GameData, NftCardClickAction, RoundedButtonConfig } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router';
import {EAppButtons, ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { defaultNftCardButtons, replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import Web3 from 'web3';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { catchError, defer, EMPTY, finalize, from, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuestsService } from '../../services/quests.service';
import { SquaredButtonConfig } from 'src/app/modules/shared/components/squared-button/squared-button.model';
import { appSquaredButton } from 'src/app/core/constants/configs/squared-button';
import { runInZone } from 'src/app/core/utilities/runInZone.operator';
import { RandomQuestDto } from 'src/app/core/interfaces/business/prompting.interface';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent extends BaseComponent implements OnInit {
  
  @ViewChild('sellButton') sellButton!: TemplateRef<any>;
  public squaredButtonConfig: SquaredButtonConfig = appSquaredButton;
  public assets = signal<AssetModel[]>([]);
  public collections:CollectionSummary[]=[];
  public customCharsCollection!: CustomCharsCollection | null;
  public loading = signal<boolean>(false);
  public abandoning = signal<AssetModel | null>(null);
  public onDisableUnfocused: EventEmitter<AssetCardButtonState> = new EventEmitter<AssetCardButtonState>();
  public onCardBtnChange: EventEmitter<AssetCardButtonState> = new EventEmitter<AssetCardButtonState>();
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  private _dialog:MatDialog = inject(MatDialog);
  private _router:Router = inject(Router);
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  private _authService:AuthService = inject(AuthService);
  private _questsService: QuestsService = inject(QuestsService);
  private _destroyRef:DestroyRef = inject(DestroyRef);
  private _ngZone: NgZone = inject(NgZone);

  @ViewChild('nftsContainer') nftsContainer!: ElementRef;

  constructor(){
    super();
  }

  ngOnInit(): void {
    this._getCharactersData();
    this._authService.onAccountChange.subscribe(newAddress => {
      this._getCharactersData();
      this._notificationsService.openSnack(ESnackAlertType.WARN, `Refreshing view for address: ${newAddress}`);
    })
    this._notificationsService.setup('center', 'bottom', 3000);
  }
  
  private _loadCollectionAssets$(address:string) : Observable<AssetModel>{
    let collectionSummary:CollectionSummary;
    return defer(() => this._smartContractsService.getCollectionSummary(address))
      .pipe(
        tap(summary => {
          this.collections.push(summary);
          collectionSummary = summary;
        }),
        switchMap(summary =>this._setupWalletNFTs$(address, collectionSummary.logoImage)) 
      )
  }

  private _setupWalletNFTs$(address:string, logoImage:string) : Observable<AssetModel>{
    return  defer(() => this._smartContractsService.getAccountCollectionNFTs(address))
    .pipe(
      switchMap(walletNFTs => from(walletNFTs)),
        mergeMap(walletNFT => this._loadAssetModel$(address, walletNFT, logoImage)),
        catchError(error => { 
          this._notificationsService.push(`An error has occured while loading the collection assets for contract ${address}: ${error.message}`)
          return EMPTY;
        })
    )
  }
  private _loadAssetModel$(address:string, walletNFT: WalletNFT, logoImage: string) : Observable<AssetModel>{
    return defer(() => this._smartContractsService.isAssetLocked(address, false, walletNFT.tokenId))
    .pipe(
      switchMap(isLocked => {
        let asset:AssetModel = {...walletNFT, metadata: walletNFT.metadata, isLocked: isLocked, collectionLogoUrl: `url(${replaceEndpoint(logoImage, 'IPFS', 'ALCHEMY')})`}
        return of(asset);
      }),
      switchMap(asset => this._setupLockedAsset$(address, asset)),
      catchError(error => { throw new Error(error.message)})
    )
  }
  private _setupLockedAsset$(address:string, asset: AssetModel) : Observable<AssetModel>{
    return defer(() => this._smartContractsService.isLockedUntil(address, false, asset.tokenId))
    .pipe(
      map(res => { asset.lockedUntil = Number(res); return asset}),
      switchMap(res => {
        return defer(() => this._smartContractsService.getPlayerSession(address, asset.tokenId))
        .pipe(
          map(session => {
            asset.isInGame = session && session.startedAt > 0;
            return asset;
          }),
          catchError(error => { throw new Error(error.message)})
        )
      })
    )
  }

  private _getCharactersData(){
    this.collections = [];
    this.customCharsCollection = null;
    let assets: AssetModel[] = [];
    let assetsLoaded: boolean = false;
    let customAssetsLoaded: boolean = false;
    this.loading.set(true);
    defer(() => this._smartContractsService.getCollectionsCatalogue())
      .pipe(
        switchMap(res => from(res)),
        mergeMap(address => this._loadCollectionAssets$(address)),
        runInZone(this._ngZone),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: asset => assets.push(asset),
        complete: () => {
          assetsLoaded = true;
          if(assetsLoaded && customAssetsLoaded){
            this.assets.update(v => [...assets]);
            this.loading.set(false);
          }
        },
        error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while loading the Immutable Collection assets: ${error.message}`)
      });
    defer(() => this._smartContractsService.getCustomCharsCatalogue())
      .pipe(
        tap(cat => this.customCharsCollection = {...cat, assets:[]}),
        switchMap(cat => this._setupWalletNFTs$(cat.contractAddress, 'assets/images/MetamaskIconBrown.png')),
        runInZone(this._ngZone),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: asset => {
          assets.push(asset);
          this.customCharsCollection?.assets.push(asset);
        },
        complete: () => {
          customAssetsLoaded = true;
          if(assetsLoaded && customAssetsLoaded){
            this.assets.update(v => [...assets]);
            this.loading.set(false);
          }
        },
        error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while loading the custom characters collection: ${error.message}`)
      });
  }

  public onUnlockAssetClick(model: AssetModel){
    if(model.isInGame){
      console.log('model owner address', model.ownerAddress);
      this.loading.set(true);
      this.abandoning.set(model);
      this.onCardBtnChange.emit({buttonId: EAppButtons.VIEW, disabled: true, contract: model.contractAddress, tokenId: `${model.tokenId}`});
      this.onDisableUnfocused.emit({buttonId: EAppButtons.ALL_BUTTONS, disabled: true, contract: model.contractAddress, tokenId: `${model.tokenId}`});
      defer(() => this._smartContractsService.abandonGame(model.contractAddress, model.tokenId))
        .pipe(
          switchMap(res => this._abandonQuest$(model.tokenId, model.contractAddress, model.ownerAddress)),
          finalize(() => {
            this.abandoning.set(null);
            this.onCardBtnChange.emit({buttonId: EAppButtons.VIEW, disabled: false, contract: model.contractAddress, tokenId: `${model.tokenId}`});
            this.onDisableUnfocused.emit({buttonId: EAppButtons.ALL_BUTTONS, disabled: false, contract: model.contractAddress, tokenId: `${model.tokenId}`});
          }),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
          next: res => {
            if(res){
              this._getCharactersData();
              this._notificationsService.openSnack(ESnackAlertType.WARN, 'Current game session abandoned', false, 3000);
            }
        },error: 
          error =>{ 
            this.loading.set(false);
            this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while abandoning the game: ${error.message}`, false, 3000);
          }
      });
    }
    else{
      //TODO payToUnlock
    }
  }

  private _abandonQuest$(tokenId: number, address:string, owner:string) : Observable<RandomQuestDto>{
    return this._questsService.getCurrentQuestFor(tokenId, address, owner)
    .pipe(
      switchMap(currentQuest => this._questsService.setQuestStatus(currentQuest.id, 'ABANDONED')),
      catchError(error => { 
        this._notificationsService.openSnack(ESnackAlertType.ERROR, 
          `An error has occured while abandoning the associated quest: ${error.message}`); 
          return EMPTY;
        })
    )
  }
  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:WalletNFT){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.contractAddress}/${model.tokenId}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    console.log('-- on view click',model);
    let cfg = new MatDialogConfig();
    Object.assign(cfg, CHAR_DETAIL_DIALOG_SIZE);
    
    if(!this.customCharsCollection || model.contractAddress !== this.customCharsCollection.contractAddress) {
      let collection = this.collections.filter(x => x.address.toLowerCase() === model.contractAddress.toLowerCase())[0]
      if(collection){
        let fileName = model.image.split('/').slice(-1)[0].replace('.png','');
        let modelInfo = await this._smartContractsService.getModelInfo(fileName, collection.address);
        let catModel:NftDetailModel = {
          name: model.metadata.name,
          metadata: model.metadata,
          imageEndpoint: model.image,
          price: parseFloat(Web3.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
          mints:modelInfo.mints,
          maxMints:modelInfo.maxMints,
        }
        cfg.data = {model:catModel, showContractData:false};
      } 
    }
    else{
      let catModel: NftDetailModel ={
          name: model.metadata.name,
          imageEndpoint: model.image,
          metadata: model.metadata,
          price: parseFloat(Web3.utils.fromWei(this.customCharsCollection.weiMintPrice.toString(),'ether') ?? '0')
      }
      cfg.data = {model:catModel, showContractData:false};
    }
    this._dialog.open(CharDetailDialogComponent, cfg);
  }

  public onCardButtonClicked(event:NftCardClickAction){
    if(!(event.asset as AssetModel)) return
    switch(event.name){
      case('view'):
        this.onViewClick(event.asset as AssetModel);
      break;
      case('select'):
        let data = localStorage.getItem('game-data');
        if(data){
          let gameData:GameData =  JSON.parse(data);
          if(gameData && gameData.isLocked){
            this._notificationsService.openSnack(ESnackAlertType.WARN, 'There is a game ongoing in another tab, cannot change the character', true);
            return;
          }
        }
        this.onSelectClick(event.asset as AssetModel);
      break;
      default: break;
    }
  }
  public onSelectClick(model:AssetModel){
    let data = localStorage.getItem('game-data');
    if(data){
      let gameData:GameData = JSON.parse(data);
      gameData.selectedCharacter = model;
      localStorage.setItem('game-data', JSON.stringify(gameData));
      this._router.navigateByUrl('randomworlds/world/generator')
    }
    else this._notificationsService.push('No Game Data has been found in memory, go back to the home page')
  }

  public onCharacterUnlocked(asset: AssetModel){
    this._notificationsService.push(`Character ${asset.metadata.name} recovered!`);
    this.onCardBtnChange.emit({buttonId: EAppButtons.SELECT, disabled: false, contract: asset.contractAddress, tokenId: `${asset.tokenId}`});
  }
}
