import { Component, Input, OnInit } from '@angular/core';
import { AssetModel } from 'src/app/core/interfaces/business/smart-contract.interface';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrl: './nft-card.component.scss'
})
export class NftCardComponent implements OnInit {

  @Input() model!: AssetModel;

  ngOnInit(): void {
    
  }
  getCollectionLogo(): string {
    return this.model ? `url(${this.model.collectionLogoUrl}` : `url(assets/images/ng-app-logo.png)`;
  }

  onViewClick(){

  }
  onSelectClick(){
    
  }
}
