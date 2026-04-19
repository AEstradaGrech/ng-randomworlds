import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { ESnackAlertType } from 'src/app/modules/shared/models/common-enums';

@Component({
  selector: 'app-character-creator-dialog',
  templateUrl: './character-creator-dialog.component.html',
  styleUrl: './character-creator-dialog.component.scss'
})
export class CharacterCreatorDialogComponent extends BaseComponent implements OnInit {

  data = inject(MAT_DIALOG_DATA);
  
  availableAmbiences:string[] = ['Test 1','Test 2', 'Test 3'];
  selectedAmbiences:string[] = [];
  
  private _connectedWallet!: string;
  ngOnInit(): void {
    this._connectedWallet = this.data.connectedWallet;
    if(!this._connectedWallet){
      this._notificationsService.openSnack(ESnackAlertType.WARN, "No connected wallet found, mint service unavailable");
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
