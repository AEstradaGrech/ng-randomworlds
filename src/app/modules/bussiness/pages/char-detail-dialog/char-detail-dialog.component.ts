import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { CharacterMetadata } from 'src/app/core/interfaces/business/smart-contract.interface';

/** Tamaño común para todos los sitios que abren el diálogo */
export const CHAR_DETAIL_DIALOG_SIZE: Partial<MatDialogConfig> = {
  width: 'min(1100px, 92vw)',  // tamaño natural, pero nunca más que la pantalla
  maxWidth: '92vw',            // Material limita por defecto a 80vw
  maxHeight: '90dvh',
  autoFocus: false,
};

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
      this.ambiences = this.metadata.profile.ambiences.join(', ');
      this.moods = this.metadata.profile.moods.join(', ');
    }
  }

  public replaceImgEndpoint(url: string) : string {
    return replaceEndpoint(url, 'IPFS', 'ALCHEMY');
  }
  public onClose(){
    this._dialog.close();
  }
}
