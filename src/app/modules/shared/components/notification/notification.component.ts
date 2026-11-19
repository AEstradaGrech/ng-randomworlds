import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationsComponent {
  messages: string[] = [];
  iconName:string = ''; // No icon displayed
  permanent: boolean = false; // cannot be removed on iconClick
  constructor(public snackBarRef: MatSnackBarRef<NotificationsComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {
    console.log('ON NOTIFICATION');
    this.messages = this.data.messages;
    if(this.data.icon)
      this.iconName = this.data.icon;
    this.permanent = this.data.permanent;
  }

  removeMessage(message: string, triggerNotify:boolean = false) {
    if(triggerNotify && this.data.onIconClick)
      this.data.onIconClick(this.iconName);
    if(!this.permanent){
      this.messages.splice(this.messages.indexOf(message), 1);
      if (this.messages.length === 0) {
          this.snackBarRef.dismiss();
      }
    }
  }
}
