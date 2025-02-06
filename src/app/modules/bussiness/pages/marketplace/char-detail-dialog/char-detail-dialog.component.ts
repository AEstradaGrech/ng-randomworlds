import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { CharacterMetadata, ModelInfo } from 'src/app/core/interfaces/business/smart-contract.interface';
import { SmartContractsService } from '../../../services/smart-contracts.service';
@Component({
  selector: 'app-char-detail-dialog',
  templateUrl: './char-detail-dialog.component.html',
  styleUrl: './char-detail-dialog.component.scss'
})
export class CharDetailDialogComponent implements OnInit{
  public data: any = inject(MAT_DIALOG_DATA);
  private _contractsService: SmartContractsService = inject(SmartContractsService);
  public metadata!:CharacterMetadata;

  ngOnInit(): void {
    //getImage
    this._contractsService.getModelMetadata(this.data.modelInfo, this.data.collectionSummary).then(res => {
      this.metadata = res;
    })
  }
  public onBuyClick(){

  }
}
