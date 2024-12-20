import { Component } from '@angular/core';

@Component({
  selector: 'app-quest-view',
  templateUrl: './quest-view.component.html',
  styleUrl: './quest-view.component.scss'
})
export class QuestViewComponent {

  public onSubmit(){
    console.log('-- on submit --')
  }
}
