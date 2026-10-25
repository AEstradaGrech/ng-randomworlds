import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { defaultImages, getRandomInt } from 'src/app/core/constants/configs/game-cards';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss'
})
export class ImageCardComponent implements OnInit {
    @Input() withProgress: boolean = true;
    @Input() title!:string;
    @Input() subtitle!:string;
    @Input() images: string[] = [];
    @Input() description!:string;
    @Input() gameMode!:string;
    @Input() imageUpdateInterval:number = 6000;

    @Output() onImageClick: EventEmitter<string> = new EventEmitter<string>();
    
    private readonly defaultImages = defaultImages;
    
    ngOnInit(): void {
      if(this.images.length === 0){
        if(this.withProgress && this.defaultImages.length >= 2){
          if(this.defaultImages.length > 2)
            this.images = this._getRandomImages(getRandomInt(this.defaultImages.length -1, 2), this.defaultImages, []); 
          }
          else this.images = [...this.defaultImages];
          
        }
        else this.images = [this.defaultImages[getRandomInt(this.defaultImages.length - 1)]];
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
