import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { defaultImages, getRandomInt, lockedGameModeImage } from 'src/app/core/constants/configs/game-cards';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss'
})
export class ImageCardComponent implements OnInit {
    @Input() withProgress: boolean = true;
    @Input() title!:string;
    @Input() subtitle!:string;
    @Input() images:string[] = [];
    @Input() description!:string;
    @Input() footerText!:string;
    @Input() actionText!:string;
    @Input() gameMode!:string;
    @Input() imageUpdateInterval:number = 6000;
    @Input() withIntervalOffset:boolean = true;
    @Input() glowColor = 'var(--teal)';
    @Input() isLocked = false;
    @Input() routeLink:string | null = null;
    @Output() onCardClick: EventEmitter<string> = new EventEmitter<string>();
    
    private readonly defaultImages = defaultImages;
    private readonly _router:Router = inject(Router);
    ngOnInit(): void {
      if(this.withIntervalOffset){
        let offset = this.imageUpdateInterval * 30 / 100;
        offset = getRandomInt(offset, offset * 0.25);
        this.imageUpdateInterval = Math.random() * 100 > 50 ? 
        this.imageUpdateInterval + offset : 
        this.imageUpdateInterval - offset;
      }
      if(!this.isLocked){
        if(this.images.length === 0){
        if(this.withProgress && this.defaultImages.length >= 2){
          if(this.defaultImages.length > 2)
            this.images = this._getRandomImages(getRandomInt(this.defaultImages.length -1, 2), this.defaultImages, []); 
          }
          else this.images = [...this.defaultImages];
          
        }
        else this.images = [this.defaultImages[getRandomInt(this.defaultImages.length - 1)]];
      }
      else this.images = this.images.length > 0 ? [this.images[0]] : [lockedGameModeImage];
    }
    
    public onCardClicked(){
      if(this.isLocked) return;
      if(this.routeLink)
        this._router.navigateByUrl(this.routeLink);
      this.onCardClick.emit(this.title);
    }

    private _getRandomImages(maxImgs: number, available: string[], selected: string[]) : string[]{
      if(selected.length === maxImgs) return selected;
      if(available.length == 0) return selected;
      let img = available[getRandomInt(available.length -1)];
      if(selected.includes(img)){
        available = available.filter(x => x !== img);
        return this._getRandomImages(maxImgs,available, selected);
      }
      selected.push(img);
      return this._getRandomImages(maxImgs, available, selected);
    }
}
