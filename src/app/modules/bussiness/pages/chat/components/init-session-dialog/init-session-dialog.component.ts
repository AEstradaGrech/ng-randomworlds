import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
@Component({
  selector: 'app-init-session-dialog',
  templateUrl: './init-session-dialog.component.html',
  styleUrl: './init-session-dialog.component.scss'
})
export class InitSessionDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  username:string = ""
  tag:string = ""
  public onUsernameChange(){
    console.log('on input change')
  }
  getFormValues(){
    const values = {
      "username" : this.username,
      "tag": this.tag,
      "valid":true
    }
    return values
  }
  cancel(){
    return {
      "valid": false
    }
  }

}
