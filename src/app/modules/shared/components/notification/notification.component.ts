import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationsComponent {
messages: string[] = [];

  constructor(public snackBarRef: MatSnackBarRef<NotificationsComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) {
    this.messages = this.data.messages;
  }

  removeMessage(message: string) {
    this.messages.splice(this.messages.indexOf(message), 1);
    if (this.messages.length === 0) {
        this.snackBarRef.dismiss();
    }
  }
}
