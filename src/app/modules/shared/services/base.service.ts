import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

export class BaseService {

protected _handleError(error:HttpErrorResponse){
    console.log(error.status === 0 ? `Network error: ${error.message}` : `Backend error >> status: ${error.status}`);
    return throwError(() => error.status === 0 ? new Error('Network error, please try again later.') : new Error(`Service unavailable >> status: ${error.status} - ${error.message}`))
  }
}