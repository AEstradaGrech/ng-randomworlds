import { inject } from "@angular/core";
import { ESnackAlertType } from "../models/common-enums";
import { NotificationService } from "../services/notification.service";

export class BaseComponent {
    protected _notificationsService: NotificationService = inject(NotificationService);
    protected _defaultErrorMessage: string = "An error occurred...";
    protected _errorDisplayType: ESnackAlertType = ESnackAlertType.ERROR;
    protected _snackMessageDuration: number = 5000;
    protected _screenTopSnack: boolean = true;

    protected _setErrorDefaults(type: ESnackAlertType, centered: boolean = true, topSnack: boolean = true, duration: number = 5000, defaultMessage: string = ''){
        this._errorDisplayType = type;
        this._screenTopSnack = topSnack;
        if(defaultMessage !== '')
            this._defaultErrorMessage = defaultMessage;
        if(duration > 0)
            this._snackMessageDuration = duration;
    }
    protected _isValidResponse(res: any){
        if (res instanceof Error) {
            this._notificationsService.openSnack(this._errorDisplayType, res.message ?? this._defaultErrorMessage, this._screenTopSnack, this._snackMessageDuration);
            return false;
        }
        return true;
    }
}