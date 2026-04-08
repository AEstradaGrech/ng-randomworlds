import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { AssetModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { NftCardClickAction, RoundedButtonConfig } from '../../models/common-interfaces';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrl: './nft-card.component.scss'
})
export class NftCardComponent implements OnInit {

  @Input() model!: AssetModel;
  @Input() disabled: boolean = false;
  @Input() cardButtons: RoundedButtonConfig[] = [];
  @Output() onCardButtonClick: EventEmitter<NftCardClickAction> = new EventEmitter<NftCardClickAction>();
  ngOnInit(): void {
    if(this.cardButtons.length > 0){
      this.cardButtons.forEach(btn => {
        if(btn.id === undefined)
          btn.id = btn.iconName;
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
