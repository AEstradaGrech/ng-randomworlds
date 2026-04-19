import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NotificationsComponent } from '../components/notification/notification.component';
import { ESnackAlertType } from '../models/common-enums';

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
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  public setup(hPos: MatSnackBarHorizontalPosition, vPos:MatSnackBarVerticalPosition, duration: number){
    this._horizontalPosition = hPos;
    this._verticalPosition = vPos;
    this._duration = duration;
  }
  public push(message: string, duration: number | null = null): void {
    this._messages.push(message);
    if (!this._snackBarIsDisplayed) {
        this._snackBarRef = this._snackBar.openFromComponent(NotificationsComponent, {
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

  openSnack(type:ESnackAlertType, message: string, topPosition: boolean = true, duration:number | null = null){
    this._snackBar.open(message, undefined, { duration: (duration? duration : this._duration), panelClass: this._getSnackStyle(type), verticalPosition: (topPosition ? 'top' : 'bottom')});
  }

  private _getSnackStyle(type:ESnackAlertType): string {
    switch(type){
      case(ESnackAlertType.SUCCESS):
        return 'snack-success';
      case(ESnackAlertType.WARN):
        return 'snack-warning';
      case(ESnackAlertType.ERROR):
        return 'snack-error';
    }
  }
}
