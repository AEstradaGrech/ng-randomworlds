import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AssetModel, CatalogueModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { AssetCardButtonState, NftCardClickAction, RoundedButtonConfig } from '../../models/common-interfaces';
import { EAppButtons } from '../../models/common-enums';
import { ALCHEMY_ENDPOINT, IPFS_ENDPOINT } from 'src/app/core/constants/configs/nft-card';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrl: './nft-card.component.scss'
})
export class NftCardComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['model']){  
      let cfg = this.cardButtons.find(x => x.id === EAppButtons.SELECT);
      if(cfg){
        cfg.disabled = changes['model'].currentValue.isInGame;
        console.log('-- on btn disabled change --');
      }
    }
  }

  @Input() model!: AssetModel | CatalogueModel;
  @Input() disabled: boolean = false;
  @Input() cardButtons: RoundedButtonConfig[] = [];
  @Input() onDisableUnfocused!: EventEmitter<AssetCardButtonState>;
  @Input() onBtnStateChange!: EventEmitter<AssetCardButtonState>;
  @Output() onCardButtonClick: EventEmitter<NftCardClickAction> = new EventEmitter<NftCardClickAction>();

  public get modelName():string{
    return this.model as AssetModel ? 
      this.modelAs<AssetModel>().metadata.name : 
      this.modelAs<CatalogueModel>().name;
  }

  public get modelDescription():string{
    return this.model as AssetModel ? 
      this.modelAs<AssetModel>().metadata.description : 
      this.modelAs<CatalogueModel>().description;
  }

  public get modelImage():string{
    return this.model as AssetModel ? 
      this.modelAs<AssetModel>().imageEndpoint : 
      this.modelAs<CatalogueModel>().imageEndpoint;
  }

  ngOnInit(): void {
    if(this.cardButtons.length > 0){
      this.cardButtons = this.cardButtons.map(card => {
        if(card.id === undefined)
          card.id = card.iconName;
        return ({...card}); // copia individual de la config para gestion disabled individual
      })
    }
    
    if(this.onBtnStateChange){
      this.onBtnStateChange.subscribe(change => {
        let modelId = this.model as AssetModel ? `${this.modelAs<AssetModel>().tokenId}` : this.modelAs<CatalogueModel>().name;
        if(change.contract === this.model.contractAddress && change.tokenId === modelId){
          let cfg = this.cardButtons.find(x => x.id === change.buttonId);
          if(cfg){
            cfg.disabled = change.disabled;
            cfg.withSpinner = change.loading ?? false;
          }
        }
      });
    }
    if(this.onDisableUnfocused){
      this.onDisableUnfocused.subscribe(change => {
        let modelId = this.model as AssetModel ? `${this.modelAs<AssetModel>().tokenId}` : this.modelAs<CatalogueModel>().name;
        if(!(change.contract === this.model.contractAddress && change.tokenId === modelId)){
          if(change.buttonId !== EAppButtons.ALL_BUTTONS){
            let cfg = this.cardButtons.find(x => x.id === change.buttonId);
            if(cfg){
              cfg.disabled = change.disabled;
            }
          }
          else this.cardButtons.forEach(cfg => cfg.disabled = change.disabled);
        }
      });
    }
  }
  isAssetModel(model: AssetModel | CatalogueModel): model is AssetModel {
    return 'tokenId' in model;   // ← la comprobación la escribes tú
  }
  modelAs<T>():T{
    return this.model as T
  }
  getCollectionLogo(): string {
    return this.model ? this.isAssetModel(this.model) ? 
      (this.modelAs<AssetModel>().collectionLogoUrl.includes(IPFS_ENDPOINT) ? 
        this.modelAs<AssetModel>().collectionLogoUrl.replace(IPFS_ENDPOINT, ALCHEMY_ENDPOINT) : 
        this.modelAs<AssetModel>().collectionLogoUrl) : 
      (this.modelAs<CatalogueModel>().logoUrl) :
      `url(assets/images/MetamaskIconBrown.png)`;
  }
  onButtonClick(event:string){
    this.onCardButtonClick.emit({name:event, asset: this.model});
  }
}
