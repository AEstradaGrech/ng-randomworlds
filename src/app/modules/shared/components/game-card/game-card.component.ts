import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent implements OnInit {
  private readonly defaultImages = ['/assets/images/City_2.png', '/assets/images/City_1.png']
  @Input() title!:string;
  @Input() subtitle!:string;
  @Input() images: string[] = [];
  @Input() description!:string;
  @Input() gameMode!:string;
  @Input() imageUpdateTimeout:number = 6000;

  @Output() onButtonClick: EventEmitter<string> = new EventEmitter<string>();
 
  cardImage = signal<string>('');
  
  ngOnInit(): void {
    if(this.images.length === 0){
      this.images = [this.defaultImages[this._getRandomInt(this.defaultImages.length - 1)]]

      this.cardImage.update(v => this.images[0]);
    }
    console.log('-- images --', this.images);
    //this._loopImages();
    //this._checkInt();
  }

  public onBeginClick(){
    if(this.gameMode)
      this.onButtonClick.emit(this.gameMode);
  }


  private _getRandomInt(max:number, min:number=0) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private _loopImages(){
    if(this.images.length >=2){
      console.log('image update')
      this.cardImage.update(v => this.images[this._getRandomInt(this.images.length -1)]);
      setTimeout(() => {this._loopImages()}, this.imageUpdateTimeout);
    }
  }
}
