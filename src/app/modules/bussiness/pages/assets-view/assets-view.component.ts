import { Component, signal, inject, OnInit, ViewChild, ElementRef, NgZone, DestroyRef, AfterViewInit, EventEmitter } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, CustomCharsCollection, NftDetailModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav'; 
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent, CHAR_DETAIL_DIALOG_SIZE } from '../char-detail-dialog/char-detail-dialog.component';
import { AssetCardButtonState, GameData, NftCardClickAction, RoundedButtonConfig, ScrollState } from 'src/app/modules/shared/models/common-interfaces';
import { defaultNftCardButtons, replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { CharacterCreatorDialogComponent } from './components/character-creator-dialog/character-creator-dialog.component';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { EAppButtons, ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { RandomQuestDto, TicketDto } from 'src/app/core/interfaces/business/prompting.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import Web3 from 'web3';
import { catchError, concatMap, defer, EMPTY, finalize, from, map, Observable, switchMap } from 'rxjs';
import { runInZone } from 'src/app/core/utilities/runInZone.operator';
import { SquaredButtonConfig } from 'src/app/modules/shared/components/squared-button/squared-button.model';
import { appSquaredButton, squaredPayButtonConfig } from 'src/app/core/constants/configs/squared-button';
import { QuestsService } from '../../services/quests.service';
import { ImagesService } from '../../services/images.service';

/**
 * Signature every handler passed to the #collectionsInfo template must satisfy,
 * so the template can call `open(item)` uniformly regardless of which one it got.
 */
export type CollectionOpenHandler = (item?: unknown) => void;
export interface LoadedCollection {
  address: string,
  isCustom: boolean,
  assets: AssetModel[]
}
@Component({
  selector: 'app-assets-view',
  templateUrl: './assets-view.component.html',
  styleUrl: './assets-view.component.scss'
})
export class AssetsViewComponent extends BaseComponent implements OnInit, AfterViewInit{
  
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  private _ngZone:NgZone = inject(NgZone);
  private _destroyRef:DestroyRef = inject(DestroyRef);
  private _authService: AuthService = inject(AuthService);
  private _questsService: QuestsService = inject(QuestsService);
  private _imagesService: ImagesService = inject(ImagesService);
  public squaredButtonConfig: SquaredButtonConfig = appSquaredButton;
  public squaredPayButtonConfig: SquaredButtonConfig = squaredPayButtonConfig;
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  public collections: AssetsCollection[] = []
  public currentCollection!: AssetsCollection | null;
  public customCharsCollection!: CustomCharsCollection | null;
  public currentCollectionLogoUrl: any;
  public loading = signal<boolean>(false);
  public abandoning = signal<AssetModel | null>(null);
  private _dialog:MatDialog = inject(MatDialog);
  public displayedAssets = signal<AssetModel[]>([]);
  public selectedContractAddress = signal<string>('');
  private _visorType:string = 'row';
  private _didInit: boolean = false;
  public onDisableUnfocused: EventEmitter<AssetCardButtonState> = new EventEmitter<AssetCardButtonState>();
  public onCardBtnChange: EventEmitter<AssetCardButtonState> = new EventEmitter<AssetCardButtonState>();
  private onCollectionLoaded: EventEmitter<LoadedCollection> = new EventEmitter<LoadedCollection>();
  private _slideScrollState: ScrollState = {
    step: 100,
    mult: 1,
    direction:'',
    isScrolling:false
  }
  private _clickScrollState: ScrollState = {
    step: 100,
    mult: 10,
    direction:'',
    isScrolling:false
  }

  public get collectionAssets(): AssetModel[]{
    return this.currentCollection ? 
      this.customCharsCollection && this.customCharsCollection.assets ? 
      [...this.currentCollection.assets, ...this.customCharsCollection.assets] : 
      this.currentCollection.assets : [];
  }

  public defaultLogoUrl:string = 'assets/images/MetamaskIconBrown.png';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('nftsContainer') nftsContainer!: ElementRef;

  constructor() { super();}

  ngAfterViewInit(): void {
    defer(() => this._smartContractsService.getWalletNFTs())
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: assets => {
          if(assets.length === 0)
            this._notificationsService.push(
            'You don\'t have any NFT to play the game. Generate one in the Character Generator or buy one in the Marketplace', 
            /*permanent*/0, 
            'center',
            null,
            null);
        }
      })
  }

  ngOnInit(): void {
  
    this.onCollectionLoaded.subscribe(data => {
      if(data.assets.length === 0) return;
      data.assets.forEach(asset => {
        this._smartContractsService.isAssetLocked(data.address, data.isCustom, asset.tokenId)
          .then(locked => {
            asset.isLocked = locked;
            if(locked){
              //asset.isInGame = checkSession
              this.onCardBtnChange.emit({buttonId: EAppButtons.SELECT, disabled: true, contract: asset.contractAddress, tokenId: `${asset.tokenId}`});
              this._smartContractsService.getPlayerSession(data.address, asset.tokenId).then(session => {
                console.log('-- on player session --', session);
                if(session.startedAt > 0)
                  asset.isInGame = true;
              });
              this._smartContractsService.isLockedUntil(data.address, data.isCustom, asset.tokenId)
                .then(lockTime => {
                  asset.lockedUntil = Number(lockTime);
              });
            }
          });
      });
    });
    // takeUntilDestroyed: without it, every past visit to this route leaves a live
    // subscription. A stale, off-screen instance would then also run _getAccountAssets
    // on account-change and update ITS OWN detached signal - so the visible view never moves.
    this._authService.onAccountChange
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(newAccount => {
        this._notificationsService.openSnack(ESnackAlertType.WARN, `Refreshing for account: ${newAccount}`, true, 3000);
        this._getAccountAssets();
      });
    this._getAccountAssets();
    this._notificationsService.setup('center', 'bottom', 3000);
  }
  
  public imageWithEndpointReplace(imageUrl: string, replaced: string, provider: string){
    return replaceEndpoint(imageUrl, replaced, provider);
  }

  private _getImmutableCollection$(address:string) : Observable<AssetsCollection>{
    let immutableCol:AssetsCollection; 
    return defer(() => this._smartContractsService.getCollectionSummary(address))
      .pipe(
        catchError(error => {throw new Error(`An error has occured while retrieving the CollectionSummary for address ${address} >> ${error.error}`)}),
        map(res => {
          immutableCol ={summary:res, assets:[]};
          this.collections.push(immutableCol);
          return immutableCol;
        }),
        switchMap(collection => this._getCollectionNFTs$(collection.summary.address, collection.summary.logoImage)),
        map(assets => {
          immutableCol.assets = assets;
          return immutableCol;
        })
      )
  }
  private _getCollectionNFTs$(address:string, collectionImage: string | null = null) : Observable<AssetModel[]>{
    return defer(() => this._smartContractsService.getAccountCollectionNFTs(address))
      .pipe(
          catchError(error => {throw new Error(`An error has occured while retrieving the Wallet NFTs for address collection ${address} >> ${error.error}`)}),
          map(assets => {
            return assets.map((nft:any) => {
              let asset:AssetModel = {...nft, collectionLogoUrl: collectionImage ? `url(${collectionImage})` : `url('assets/images/MetamaskIconBrown.png')`}
              return asset;
            });
          })
        )
  }

  private _getAccountAssets() {
    this._didInit = false;
    this.currentCollection = null;
    this.customCharsCollection = null;
    this.collections = [];
    defer(() => this._smartContractsService.getCollectionsCatalogue())
      .pipe(
        switchMap(cat => from(cat)),
        concatMap(address => 
          this._getImmutableCollection$(address)
            .pipe(
              catchError(error => {
                this._notificationsService.push(`Collection: ${address} failed to initialize >> ERROR: ${error.message}`); 
                return EMPTY;})
            )
        ),
        runInZone(this._ngZone),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: collection => {
          if(collection){
            if (!this.currentCollection) {                           
            this.currentCollection = collection;
            this.currentCollectionLogoUrl = `url(${collection.summary.logoImage})`;
          }
          this.onCollectionLoaded.emit({address: collection.summary.address, isCustom: false, assets: collection.assets });
          }
        },
        error: error => this._notificationsService.push(`An error has occured while loading the Immutable Collections catalogue: ${error.message}`),
        complete: () => {
          if(this.currentCollection){
            this._didInit = true;
            this.selectCollection(this.currentCollection);
          }
        }
      })

      defer(() => this._smartContractsService.getCustomCharsCatalogue())
        .pipe(
          map(cat => {
            this.customCharsCollection = {...cat, assets:[]}
            return this.customCharsCollection;
          }),
          switchMap(customCol => this._getCollectionNFTs$(customCol.contractAddress)),
          runInZone(this._ngZone),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
          next: assets => {
            if(this.customCharsCollection){
              this.customCharsCollection.assets = assets;
              this.onCollectionLoaded.emit({address: this.customCharsCollection.contractAddress, isCustom: false, assets: this.customCharsCollection.assets });
              if(this._visorType === 'grid')
                this.onVisorTypeChange('grid');
              setTimeout(() => {
                if(!this.currentCollection)
                  this.selectCustomCharsCollection();
                if(this.customCharsCollection && this.selectedContractAddress() === this.customCharsCollection.contractAddress){
                  this.selectCustomCharsCollection();
                }
              }, 3000);
            }
          },
          error: error => {
            this._notificationsService.push(`An error has occured while loading the Custom Characters data: ${error.message}`);
            this.customCharsCollection = null;
          }
        })
  }

  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:AssetModel){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.contractAddress}/${model.tokenId}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    let cfg = new MatDialogConfig();
    Object.assign(cfg, CHAR_DETAIL_DIALOG_SIZE);
    if(this.customCharsCollection && model.contractAddress === this.customCharsCollection.contractAddress){
      let detailModel: NftDetailModel = {
          name: model.metadata.name,
          imageEndpoint: model.image,
          metadata: model.metadata,
          price: parseFloat(Web3.utils.fromWei(this.customCharsCollection.weiMintPrice.toString(),'ether') ?? '0')
        }
      cfg.data = {model:detailModel, showContractData:true};
    }
    else{
      let collection = this.collections.filter(x => x.summary.address.toLowerCase() === model.contractAddress.toLowerCase())[0]
      if(collection){
        let fileName = model.image.split('/').slice(-1)[0].replace('.png','');
        let modelInfo = await this._smartContractsService.getModelInfo(fileName, collection.summary.address);
        let detailModel: NftDetailModel = {
          name: model.metadata.name,
          metadata: model.metadata,
          imageEndpoint: model.image,
          price: parseFloat(Web3.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
          mints:modelInfo.mints,
          maxMints:modelInfo.maxMints,
        }
        cfg.data = {model:detailModel, showContractData:true};
      }
    }
    this._dialog.open(CharDetailDialogComponent, cfg);
  }
  public onSellClick(model:AssetModel){
    console.log('-- on sell click (TODO) --', model)
    this._notificationsService.openSnack(ESnackAlertType.WARN, 'Work In Progress');
  }

  public onUnlockAssetClick(model: AssetModel){
    if(model.isInGame){
      this.loading.set(true);
      this.abandoning.set(model);
      this.onCardBtnChange.emit({buttonId: EAppButtons.VIEW, disabled: true, contract: model.contractAddress, tokenId: `${model.tokenId}`});
      this.onDisableUnfocused.emit({buttonId: EAppButtons.ALL_BUTTONS, disabled: true, contract: model.contractAddress, tokenId: `${model.tokenId}`});
      defer(() => this._smartContractsService.abandonGame(model.contractAddress, model.tokenId))
        .pipe(
          switchMap(res => this._abandonQuest(model.tokenId, model.contractAddress, model.ownerAddress)),
          finalize(() => {
            this.loading.set(false);
            this.abandoning.set(null);
            this.onCardBtnChange.emit({buttonId: EAppButtons.VIEW, disabled: false, contract: model.contractAddress, tokenId: `${model.tokenId}`});
            this.onDisableUnfocused.emit({buttonId: EAppButtons.ALL_BUTTONS, disabled: false, contract: model.contractAddress, tokenId: `${model.tokenId}`});
          }),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
          next: res => {
            if(res){
              this._getAccountAssets();
              this._notificationsService.openSnack(ESnackAlertType.WARN, 'Current game session abandoned', false, 3000);
            }
        },error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while abandoning the game: ${error.message}`, false, 3000)
      });
    }
    else{
      //TODO payToUnlock
    }
  }

  private _abandonQuest(tokenId: number, address:string, owner:string) : Observable<RandomQuestDto>{
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
  public onSlideViewClick(direction: string){
    if(this._slideScrollState.isScrolling) return;
    this._clickScrollState.direction = direction;
    this._clickScrollState.isScrolling = true;
    let currentScroll = this.nftsContainer.nativeElement.scrollLeft;
    let dirMult:number = this._clickScrollState.direction === 'right' ? 1 : -1;
    this.nftsContainer.nativeElement.scrollTo({
      left: currentScroll + this._clickScrollState.step * this._clickScrollState.mult * dirMult,
      behavior: 'smooth'
    })
  }
  public onSlideViewPress(direction: string){
    setTimeout(() => {
      if(this._clickScrollState.isScrolling) return;
      this._slideScrollState.direction = direction;
      this._slideScrollState.isScrolling = true;
      this._scrollVisor();
    }, 90);
  }
  public onSlideViewRelease(){
    setTimeout(()=> {
      this._slideScrollState.direction = '';
      this._slideScrollState.isScrolling = false;
      this._clickScrollState.direction = '';
      this._clickScrollState.isScrolling = false;
    }, 75);
  }
  private _scrollVisor(){
    if(this._slideScrollState.isScrolling && this._slideScrollState.direction){
      let dirMult:number = this._slideScrollState.direction === 'right' ? 1 : -1;
      this.nftsContainer.nativeElement.scrollLeft += this._slideScrollState.step * this._slideScrollState.mult * dirMult;
      setTimeout(() => {this._scrollVisor()}, 50);
    }
  }
  public closeSidenav() {
    this.sidenav.close();
  }

  /*
   * These two are passed BY REFERENCE through the #collectionsInfo template
   * context and invoked from (opened). They are arrow properties, not methods,
   * on purpose: the template calls them off the context object, so a plain
   * method would bind `this` to that context instead of the component.
   * Each call site passes the handler it wants, so no runtime type check.
   */
  public readonly selectCustomCharsCollection: CollectionOpenHandler = () => {
    if(this.customCharsCollection){
      if(this._visorType !== 'row'){
        this.selectedContractAddress.set(this.customCharsCollection.contractAddress);
        return;
      }
      this.displayedAssets.set(this.customCharsCollection.assets);
      //this.displayedAssets = [...this.customCharsCollection.assets];
      this.selectedContractAddress.set(this.customCharsCollection.contractAddress);
    }
  }
  public onVisorTypeChange(visualization: string){
    if(visualization !== 'grid' && visualization !== 'row') return;
    this._visorType = visualization;
    if(visualization === 'grid'){
      let assets: AssetModel[] = [];
      if(this.customCharsCollection && this.customCharsCollection.assets.length > 0){
        assets = [...this.customCharsCollection.assets];
      }
      if(this.collections.length > 0){
        this.collections.forEach(col => assets = [...assets, ...col.assets]);
        this.displayedAssets.set(assets);
      }
    }
    else{
      if(!this.currentCollection && this.collections.length > 0)
        this.collections[0];
      
      if(!this.currentCollection){
        if(this.customCharsCollection)
          this.selectCustomCharsCollection();
      }
      else this.selectCollection(this.currentCollection);
    }
  }
  public readonly selectCollection: CollectionOpenHandler = (item?: unknown) => {
    if(!this._didInit) return;
    const collection = item as AssetsCollection;
    if(!collection) return;
    this.currentCollection = this.collections.filter(x => x.summary.address === collection.summary.address)[0]
    if(!this.currentCollection) return;
    if(this._visorType === 'row'){
      this.displayedAssets.update(x => this.currentCollection ? [...this.currentCollection.assets] : []);  
    }
    else this.onVisorTypeChange('grid');
    this.selectedContractAddress.set(this.currentCollection.summary.address);
  }
  public onCardButtonClicked(event:NftCardClickAction){
    console.log('-- char selection >> card btn clicked --', event)
    if(!(event.asset as AssetModel)) return;
    switch(event.name){
      case('view'):
        this.onViewClick(event.asset as AssetModel);
      break;
      case('select'):
        this.onCardSelected(event.asset as AssetModel);
      break;
      default: break;
    }
  }
  public onCreateCharacterClick(){
    this._imagesService.getProviderSettings().subscribe({
      next: res => {
        if(res){
          this._dialog.open(CharacterCreatorDialogComponent, { 
            data: {
              connectedWallet: this._smartContractsService.connectedWallet,
              diffusionSettings: res
            },
            panelClass: ['char-creator-dialog-box']
          })
            .afterClosed()
            .subscribe((result:TicketDto | string) => {
              if(result && typeof result !== "string"){ 
                this.selectCustomCharsCollection();
                setTimeout(() => {this._notificationsService.openSnack(ESnackAlertType.SUCCESS, "On Character Created");}, 2000);
                this._refreshCustomCharacters();
              }
              else this._notificationsService.push(result as string, 3000);
          })
        }
      },
      error: error => {
        this._notificationsService.openSnack(ESnackAlertType.ERROR, 'DIFFUSION API SERVICE NOT AVAILABLE', false, 3000);
      }
    })
  }

  private _refreshCustomCharacters(){
    if(this.customCharsCollection){
       this._getCollectionNFTs$(this.customCharsCollection.contractAddress)
        .pipe(
          runInZone(this._ngZone),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
          next: assets => {
            if(this.customCharsCollection)
              this.customCharsCollection.assets = assets;
          },
          error: error => this._notificationsService.openSnack(ESnackAlertType.WARN, 'An error has occured while refreshing the Custom Characters data')
        })
    }
  }
  public onCardSelected(asset: AssetModel){
    
    let data = localStorage.getItem('game-data');
    if(data){
      let gameData:GameData = JSON.parse(data);
      gameData.selectedCharacter = asset;
      gameData.gameSessionId = '';
      gameData.character = undefined;
      gameData.gameStatus = '';
      localStorage.setItem('game-data', JSON.stringify(gameData));
      this._notificationsService.push(`Selected Character: ${asset.metadata.name}`);
    }
    else this._notificationsService.push('No Game Data has been found in memory, go back to the home page')
  }
}
