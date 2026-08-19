import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AssetModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { AssetCardButtonState, NftCardClickAction, RoundedButtonConfig } from '../../models/common-interfaces';
import { EAppButtons } from '../../models/common-enums';

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

  @Input() model!: AssetModel;
  @Input() disabled: boolean = false;
  @Input() cardButtons: RoundedButtonConfig[] = [];
  @Input() onBtnStateChange!: EventEmitter<AssetCardButtonState>;
  @Output() onCardButtonClick: EventEmitter<NftCardClickAction> = new EventEmitter<NftCardClickAction>();

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
        if(change.contract === this.model.contractAddress && change.tokenId === this.model.tokenId){
          let cfg = this.cardButtons.find(x => x.id === change.buttonId);
          if(cfg){
            cfg.disabled = change.disabled;
            console.log('-- on btn disabled change --');
          }
        }
      });
    }
  }

  getCollectionLogo(): string {
    return this.model ? this.model.collectionLogoUrl : `url(assets/images/ng-app-logo.png)`;
  }
  onButtonClick(event:string){
    console.log('-- clicked button ID --', event)
    this.onCardButtonClick.emit({name:event, asset: this.model});
  }
}
