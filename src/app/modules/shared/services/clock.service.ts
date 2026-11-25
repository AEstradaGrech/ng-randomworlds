import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  readonly now = signal(Date.now());
  private _interval:number = 1000;
  constructor() { 
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      setInterval(() => this.now.set(Date.now()), this._interval); 
    }
  }

  public setInterval(value: number){
    if(value > 0)
      this._interval = value;
  }
}
