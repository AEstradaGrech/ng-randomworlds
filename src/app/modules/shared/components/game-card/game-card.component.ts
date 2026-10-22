import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {

  @Input() title!:string;
  @Input() subtitle!:string;
  @Input() images: string[] = [];
  @Input() description!:string;
  
  public onBeginClick(mode:string){

  }
}
