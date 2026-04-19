import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { ImagesService } from 'src/app/modules/bussiness/services/images.service';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { SystemMessageDto } from 'src/app/modules/shared/models/mgmt-interfaces';

@Component({
  selector: 'app-character-creator-dialog',
  templateUrl: './character-creator-dialog.component.html',
  styleUrl: './character-creator-dialog.component.scss'
})
export class CharacterCreatorDialogComponent extends BaseComponent implements OnInit {

  data = inject(MAT_DIALOG_DATA);
  
  availableAmbiences:string[] = ['Test 1','Test 2', 'Test 3'];
  selectedAmbiences:string[] = [];
  availableMoods:string[] = ['Test 1','Test 2', 'Test 3'];
  selectedMoods:string[] = [];
  private _connectedWallet!: string;
  private _imagesService: ImagesService = inject(ImagesService);
  ngOnInit(): void {
    this._connectedWallet = this.data.connectedWallet;
    if(!this._connectedWallet){
      this._notificationsService.openSnack(ESnackAlertType.WARN, "No connected wallet found, mint service unavailable");
    }
    this._imagesService.getAmbiences().subscribe(res => {
      console.log('-- on ambiences response --', res);
      this.availableAmbiences = res.data.map((item:SystemMessageDto) => item.description);
      console.log('-- mapped ambiences --', this.availableAmbiences);
    })
    this._imagesService.getAmbiences().subscribe(res => {
      console.log('-- on moods response --', res);
      this.availableMoods = res.data.map((item:SystemMessageDto) => item.description);
      console.log('-- mapped moods --', this.availableMoods);
    })
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
