import { Component, signal, inject, OnInit, ViewChild, Inject, ElementRef, NgZone, DestroyRef, AfterViewInit, EventEmitter } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { AssetModel, AssetsCollection, CustomCharsCollection, NftDetailModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CharDetailDialogComponent } from '../char-detail-dialog/char-detail-dialog.component';
import web3 from 'src/app/core/scripts/web3';
import { AssetCardButtonState, GameData, NftCardClickAction, RoundedButtonConfig, ScrollState } from 'src/app/modules/shared/models/common-interfaces';
import { defaultNftCardButtons } from 'src/app/core/constants/configs/nft-card';
import { CharacterCreatorDialogComponent } from './components/character-creator-dialog/character-creator-dialog.component';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { EAppButtons, ESnackAlertType } from 'src/app/modules/shared/models/common-enums';

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
export class AssetsViewComponent extends BaseComponent implements OnInit{
  private _smartContractsService:SmartContractsService = inject(SmartContractsService);
  private _ngZone:NgZone = inject(NgZone);
  private _destroyRef:DestroyRef = inject(DestroyRef);
  public nftCardButtonsConfig: RoundedButtonConfig[] = defaultNftCardButtons;
  public collections: AssetsCollection[] = []
  public currentCollection!: AssetsCollection | null;
  public customCharsCollection!: CustomCharsCollection | null;
  public currentCollectionLogoUrl: any;
  public loading:boolean = false;
  private _dialog:MatDialog = inject(MatDialog);
  public displayedAssets = signal<AssetModel[]>([]);
  public selectedContractAddress = signal<string>('');
  private _visorType:string = 'row';
  private _didInit: boolean = false;
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

  constructor(@Inject(DOCUMENT) private document:Document) { super();}

  ngOnInit(): void {
    this.onCollectionLoaded.subscribe(data => {
      console.log('-- on collection loaded --', data);
      if(data.assets.length === 0) return;
      data.assets.forEach(asset => {
        this._smartContractsService.isAssetLocked(data.address, data.isCustom, asset.tokenId)
          .then(locked => {
            asset.isLocked = locked;
            if(locked){
              //asset.isInGame = checkSession
              this.onCardBtnChange.emit({buttonId: EAppButtons.SELECT, disabled: true, contract: asset.contractAddress, tokenId: asset.tokenId});
              this._smartContractsService.getPlayerSession(data.address, asset.tokenId).then(session => {
                console.log('-- on player session --', session);
                if(session.startedAt > 0)
                  asset.isInGame = true;
              });
              this._smartContractsService.isLockedUntil(data.address, data.isCustom, asset.tokenId)
                .then(lockTime => {
                  asset.lockedUntil = lockTime;
              });
            }
          });
      });
    });
    // takeUntilDestroyed: without it, every past visit to this route leaves a live
    // subscription. A stale, off-screen instance would then also run _getAccountAssets
    // on account-change and update ITS OWN detached signal - so the visible view never moves.
    this._smartContractsService.onAccountChanged
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(newAccount => {
        this._notificationsService.openSnack(ESnackAlertType.WARN, `Refreshing for account: ${newAccount}`, true, 3000);
        this._getAccountAssets();
      });
    this._getAccountAssets();
    this._notificationsService.setup('center', 'bottom', 3000);
  }
  
  private _getAccountAssets() {
    this._didInit = false;
    this.currentCollection = null;
    this.customCharsCollection = null;
    this.collections = [];
    this._smartContractsService.getCollectionsCatalogue().then(cat => {
      cat.forEach(address => {
        this._smartContractsService.getCollectionSummary(address).then(summary => {
          this._ngZone.run(() => {
            console.log('summary', summary);
            let collection:AssetsCollection = {summary:summary, assets:[]};
            this.collections.push(collection);
            this._smartContractsService.getAccountCollectionNFTs(summary.address).then(walletNFTs => {
              console.log('-- on col wallet resp --', walletNFTs);
              this._ngZone.run(() => {
                collection.assets = walletNFTs.map((nft:any) => {
                  let asset:AssetModel = {...nft, collectionLogoUrl: `url(${summary.logoImage})`}
                  return asset;
                });
                this.onCollectionLoaded.emit({address: collection.summary.address, isCustom: false, assets: collection.assets });
                if(!this.currentCollection){
                  this._didInit = true;
                  this.currentCollection = collection;
                  this.currentCollectionLogoUrl = `url(${this.currentCollection.summary.logoImage}`;
                  this.selectCollection(this.currentCollection);
                }
              })
            })
          })
        })
      })
    });
    this._smartContractsService.getCustomCharsCatalogue().then(cat => {
      this._ngZone.run(() => {
        if(cat) {
          this.customCharsCollection = {...cat, assets:[]};
          this._getCustomCharacters();
        }
      })
    });
  }
  private _getCustomCharacters(){
    if(this.customCharsCollection){
      this._smartContractsService.getAccountCollectionNFTs(this.customCharsCollection.contractAddress)
        .then(walletNFTs => {
          console.log('-- on col wallet resp --', walletNFTs)
          if(walletNFTs.length > 0){
            if(this.customCharsCollection){
              this.customCharsCollection.assets = walletNFTs.map((nft:any) => {
                let asset:AssetModel = {...nft, collectionLogoUrl: `url('assets/images/MetaMaskIconBrown.png')`}
                return asset;
              });
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
          }
          else{
            this.customCharsCollection = null;
          }
        })
    }
  }

  public onViewCollectionClick(address:string){
    window.open(`https://sepolia.etherscan.io/token/${address}`, "_blank");
  }
  public onViewOnOpenSeaClick(model:AssetModel){
    window.open(`https://testnets.opensea.io/assets/sepolia/${model.contractAddress}/${model.tokenId}`, "_blank");
  }
  public async onViewClick(model:AssetModel){
    console.log('-- on view click',model);
    let cfg = new MatDialogConfig();
    cfg.height = '90vh';
    cfg.width = '1100px';
    if(this.customCharsCollection && model.contractAddress === this.customCharsCollection.contractAddress){
      let detailModel: NftDetailModel = {
          name: model.metadata.name,
          imageEndpoint: model.image,
          metadata: model.metadata,
          price: parseFloat(web3(this.document)?.utils.fromWei(this.customCharsCollection.weiMintPrice.toString(),'ether') ?? '0')
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
          price: parseFloat(web3(this.document)?.utils.fromWei(modelInfo.price.toString(),'ether') ?? '0'),
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
  }

  public onUnlockAssetClick(model: AssetModel){
    if(model.isInGame){
      this._smartContractsService.abandonGame(model.contractAddress, model.tokenId).then(res => {
        if(res){
          this._getAccountAssets();
          this._notificationsService.openSnack(ESnackAlertType.WARN, 'Current game session abandoned', false, 3000);
        }
        else this._notificationsService.openSnack(ESnackAlertType.ERROR, 'An error has occured while abandoning the game', false, 3000);
      });
    }
    else{
      //TODO payToUnlock
    }
    // getGameSessionKey
    // getSession
    // if session -> displayText = Character in game
    // else displayText = Character recovering + lockedUntil --> (v0.1.2)WORDS | PAY unlock
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
    switch(event.name){
      case('view'):
        this.onViewClick(event.asset);
      break;
      case('select'):
        console.log('-- on select click --', event.asset);
        let data = localStorage.getItem('game-data');
        if(data){
          let gameData:GameData = JSON.parse(data);
          if(gameData.isLocked){
            this._notificationsService.openSnack(ESnackAlertType.WARN, 'There is a game ongoing in another tab, cannot change the character', true);
            return;
          }
          gameData.selectedCharacter = event.asset;
          localStorage.setItem('game-data', JSON.stringify(gameData));
          this._notificationsService.push(`Selected Character: ${event.asset.metadata.name}`);
        }
        else this._notificationsService.push('No Game Data has been found in memory, go back to the home page')
      break;
      default: break;
    }
  }
  public onCreateCharacterClick(){
    console.log('-- on create character click --');
    this._dialog.open(CharacterCreatorDialogComponent, { data: {connectedWallet: this._smartContractsService.connectedWallet }})
      .afterClosed()
      .subscribe(result => {
        if(true){
          this.selectCustomCharsCollection();
          setTimeout(() => {this._notificationsService.openSnack(ESnackAlertType.SUCCESS, "On Character Created");}, 2000);
          this._getCustomCharacters();
          //refresh NFTs
        }
    })
  }
}
