import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { TreeMenuItem } from '../../../modules/shared/components/tree-menu/tree-menu-item.model';
import { NavBarTab } from '../../../modules/shared/components/tabs-nav-bar/nav-bar-tab.model';
import { mainNavBarConfig } from '../../constants/configs/header-navbar';
import { HeaderNavbarComponent } from 'src/app/modules/shared/components/header-navbar/header-navbar.component';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements AfterViewInit {

  @ViewChild('navbar') navbar!: HeaderNavbarComponent 
  ngAfterViewInit(): void {
    this.navbar.getTabsComponent().forceActive('Play')
    console.log('setting tab active')
  }


  public headBarConfig: Array<NavBarTab> = mainNavBarConfig;
}
