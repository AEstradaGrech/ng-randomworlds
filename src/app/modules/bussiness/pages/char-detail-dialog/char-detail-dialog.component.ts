import { Component, inject, OnInit, signal } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { CharacterMetadata } from 'src/app/core/interfaces/business/smart-contract.interface';

@Component({
  selector: 'app-char-detail-dialog',
  templateUrl: './char-detail-dialog.component.html',
  styleUrl: './char-detail-dialog.component.scss'
})
export class CharDetailDialogComponent implements OnInit{
  public data: any = inject(MAT_DIALOG_DATA);
  private _dialog:MatDialogRef<CharDetailDialogComponent> = inject(MatDialogRef<CharDetailDialogComponent>)
  public metadata!:CharacterMetadata;
  public ambiences: string = "";
  public moods: string = "";
  
  public get tokenRarity(): string{
    return this.metadata ? this.metadata.attributes.find(x => x['trait_type'].toLowerCase() === 'rarity').value : '';
  } 

  ngOnInit(): void {
    console.log('-- on char detail dialog init --');
    this.metadata = this.data.model.metadata;
    if(this.metadata){
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
    }
  }
  public onClose(){
    this._dialog.close();
  }
}
