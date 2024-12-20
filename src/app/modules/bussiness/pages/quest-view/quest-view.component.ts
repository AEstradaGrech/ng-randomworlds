import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { questViewSidebarConfig } from 'src/app/core/constants/configs/side-navbar';
import { TreeMenuItem } from 'src/app/modules/shared/components/tree-menu/tree-menu-item.model';

@Component({
  selector: 'app-quest-view',
  templateUrl: './quest-view.component.html',
  styleUrl: './quest-view.component.scss',
  animations: [
    trigger('panelStateL', [
      state('visible', style({ width: '*', opacity: 1 })),
      state('hidden', style({ width: '0', opacity: 0, overflow: 'hidden' })),
      transition('* => visible', animate('300ms ease-in')),
      transition('* => hidden', animate('300ms ease-out'))
    ]),
    trigger('panelStateR', [
      state('visible', style({ width: '*', opacity: 1 })),
      state('hidden', style({ width: '0', opacity: 0, overflow: 'hidden' })),
      transition('* => visible', animate('300ms ease-in')),
      transition('* => hidden', animate('300ms ease-out'))
    ])
  ]
})
export class QuestViewComponent {

  actionsBarConfig:Array<TreeMenuItem> = questViewSidebarConfig;
  panelStateR = 'hidden';
  panelStateL = 'hidden';
  
  choicesMock = [
    "In Quest Mode you can play an adventure in a random world with your selected character. The genre of the story and the generated lore depends on your selected character and your the settings you choose at the beginning of the adventure",
    "In this mode all the adventures begin in a tavern of the generated world, where you will be able to start different quests with the guidance of the AI Game Master",
    "The game follows a 'Choose your own adventure' style in which the Game Master will present you an scenario with up to four possible actions to choose from, and progress in your story in order to complete your Quest and save your progression or die trying!",
    "And this is a shorter option to see how does it fit"
  ]
  selectedChoice!:string | null;
  private _snackBar = inject(MatSnackBar);
  public onSubmit(){
    console.log('-- on submit --')
    if(!this.selectedChoice || this.selectedChoice === '' ){
      this._snackBar.open("You must pick a choice from the available to continue", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
      return;
    }
  }

  onOpenBtnClick(btn:string){
    if(btn === 'left'){
      console.log('-- on left click --')
      this.panelStateL = (this.panelStateL === 'visible') ? 'hidden' : 'visible';
    }else{
      console.log('-- on right btn click --')
      this.panelStateR = (this.panelStateR === 'visible') ? 'hidden' : 'visible';
    }
  }
}
