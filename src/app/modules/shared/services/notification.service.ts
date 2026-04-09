import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NotificationsComponent } from '../components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private _messages: string[] = [];
  private _snackBarRef!: MatSnackBarRef<NotificationsComponent>;
  private _snackBarIsDisplayed: boolean = false;
  private _horizontalPosition:MatSnackBarHorizontalPosition = 'center';
  private _verticalPosition:MatSnackBarVerticalPosition = 'top';
  private _duration:number = 5000;
  constructor(private snackBar: MatSnackBar) {}

  public setup(hPos: MatSnackBarHorizontalPosition, vPos:MatSnackBarVerticalPosition, duration: number){
    this._horizontalPosition = hPos;
    this._verticalPosition = vPos;
    this._duration = duration;
  }
  public push(message: string, duration: number | null = null): void {
    this._messages.push(message);
    if (!this._snackBarIsDisplayed) {
        this._snackBarRef = this.snackBar.openFromComponent(NotificationsComponent, {
            horizontalPosition: this._horizontalPosition,
            verticalPosition: this._verticalPosition,
            data: {
                messages: this._messages,
                duration: duration ?? this._duration,
            }
        });
        this._snackBarIsDisplayed = true;
    }
    setTimeout(() => this._snackBarRef.instance.removeMessage(message), duration ?? this._duration);
    this._snackBarRef.afterDismissed().subscribe(() => {
        this._snackBarIsDisplayed = false;
    });
  }
}
