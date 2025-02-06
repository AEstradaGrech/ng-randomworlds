import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { CatalogueModel, CharacterMetadata, ModelInfo } from 'src/app/core/interfaces/business/smart-contract.interface';
import { SmartContractsService } from '../../../services/smart-contracts.service';
@Component({
  selector: 'app-char-detail-dialog',
  templateUrl: './char-detail-dialog.component.html',
  styleUrl: './char-detail-dialog.component.scss'
})
export class CharDetailDialogComponent implements OnInit{
  public data: CatalogueModel = inject(MAT_DIALOG_DATA);
  private _contractsService: SmartContractsService = inject(SmartContractsService);
  public metadata!:CharacterMetadata;

  ngOnInit(): void {
    //getImage
    this._contractsService.getMetadata(this.data).then(res => {
      this.metadata = res;
      console.log('-- on get metadata --', this.metadata);
    })
  }
  public onBuyClick(){

  }
}
