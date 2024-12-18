import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavBarTab } from './nav-bar-tab.model';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tabs-nav-bar',
  templateUrl: './tabs-nav-bar.component.html',
  styleUrl: './tabs-nav-bar.component.scss',
  animations:[
    trigger('rotateArrow',[
      state('close', style({transform: 'rotate( 0 )'})),
      state('open', style({transform: 'rotate( 90deg )'})),
      transition('close => open', [animate(200)]),
      transition('open => close', [animate(200)])
    ])
  ]
})
export class TabsNavBarComponent {

  @Input() tabs!: Array<NavBarTab>;
  @Input() withLogo: boolean = false;
  @Input() type: string = 'list'
  @Input() height: string = '270px';

  @Output() onTabClicked: EventEmitter<NavBarTab> = new EventEmitter<NavBarTab>();

  public onTabClick(event:NavBarTab) {
    event.isActive = true;
    this.updateActiveTab(event);
    this.onTabClicked.emit(event);
  }

  private updateActiveTab(selected: NavBarTab){
    this.tabs.forEach(tab => {
      if(tab !== selected)
        tab.isActive = false;
    })
  }

  public forceActive(tabName:string){
    this.tabs.forEach(tab => { tab.isActive = tabName === tab.name? true : false })
  }

  public resetState(){
    this.tabs.forEach(tab => { tab.isActive = false })
  }
}
