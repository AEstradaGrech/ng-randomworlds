import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { sideNavbarConfig } from '../../constants/configs/side-navbar';
import { TreeMenuItem } from '../../../modules/shared/components/tree-menu/tree-menu-item.model';
import { NavBarTab } from '../../../modules/shared/components/tabs-nav-bar/nav-bar-tab.model';
import { demoNavBarConfig } from '../../constants/configs/header-navbar';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  public sideBarConfig:Array<TreeMenuItem> = sideNavbarConfig;
  public headBarConfig: Array<NavBarTab> = demoNavBarConfig;
}
