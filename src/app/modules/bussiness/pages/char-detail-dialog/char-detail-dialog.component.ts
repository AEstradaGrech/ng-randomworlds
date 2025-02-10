import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { CatalogueModel, CharacterMetadata, ModelInfo } from 'src/app/core/interfaces/business/smart-contract.interface';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { NanToNumPipe } from 'src/app/modules/shared/pipes/nan-to-num.pipe';
@Component({
  selector: 'app-char-detail-dialog',
  templateUrl: './char-detail-dialog.component.html',
  styleUrl: './char-detail-dialog.component.scss'
})
export class CharDetailDialogComponent implements OnInit{
  public data: CatalogueModel = inject(MAT_DIALOG_DATA);
  private _dialog:MatDialogRef<CharDetailDialogComponent> = inject(MatDialogRef<CharDetailDialogComponent>)
  private _contractsService: SmartContractsService = inject(SmartContractsService);
  public metadata!:CharacterMetadata;
  public ambiences: string = "";
  public moods: string = "";
  ngOnInit(): void {
    this._contractsService.getMetadata(this.data).then(res => {
      this.metadata = res;
      console.log('-- on get metadata --', this.metadata);
      for(let i=0; i<this.metadata.profile.ambiences.length; i++){
        this.ambiences += this.metadata.profile.ambiences[i];
        if(i !== this.metadata.profile.ambiences.length - 1)
          this.ambiences += ', ';
      }
      for(let i=0; i<this.metadata.profile.moods.length; i++){
        this.moods += this.metadata.profile.moods[i];
        if(i !== this.metadata.profile.moods.length - 1)
          this.moods += ', ';
      }
    })
  }
  public onClose(){
    this._dialog.close();
  }
}
