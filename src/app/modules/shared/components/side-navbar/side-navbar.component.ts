import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TreeMenuItem } from '../tree-menu/tree-menu-item.model';
import { TreeMenuComponent } from '../tree-menu/tree-menu.component';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.scss'
})
export class SideNavbarComponent {
  @Input() config!: Array<TreeMenuItem>;
  @Input() width: string = '240px'
  @Input() withLogo: boolean = true;
  @Output() onSelect: EventEmitter<TreeMenuItem> = new EventEmitter<TreeMenuItem>()
  @ViewChild('treemenu') treeMenu!:TreeMenuComponent;

  public onMenuSelect(event:TreeMenuItem){
    this.onSelect.emit(event)
  }

  public setMenuEnabled(name:string){
    this.treeMenu.setMenuEnabled(name);
  }
}
