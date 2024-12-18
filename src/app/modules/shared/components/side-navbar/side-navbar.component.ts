import { Component, Input } from '@angular/core';
import { TreeMenuItem } from '../tree-menu/tree-menu-item.model';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.scss'
})
export class SideNavbarComponent {
  @Input() config!: Array<TreeMenuItem>;
  @Input() width: string = '240px'
  @Input() withLogo: boolean = true;
}
