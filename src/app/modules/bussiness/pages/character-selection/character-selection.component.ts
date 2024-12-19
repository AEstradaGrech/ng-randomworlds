import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrl: './character-selection.component.scss'
})
export class CharacterSelectionComponent implements OnInit {
  
  ngOnInit(): void {
    console.log(`-- game type ${localStorage.getItem('game-type')} --`)
  }

}
