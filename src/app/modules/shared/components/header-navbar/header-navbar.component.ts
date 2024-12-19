import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavBarTab } from '../tabs-nav-bar/nav-bar-tab.model';
import { Router } from '@angular/router';
import { TabsNavBarComponent } from '../tabs-nav-bar/tabs-nav-bar.component';


@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrl: './header-navbar.component.scss'
})
export class HeaderNavbarComponent implements OnInit {
  @ViewChild('navTabs') navTabs!: TabsNavBarComponent
  @Input() config!: Array<NavBarTab>;
  @Input() height: string = '240px'
  @Input() withLogo: boolean = true;
  @Output() onTabClicked: EventEmitter<NavBarTab> = new EventEmitter<NavBarTab>()
  constructor(private router:Router){}
  
  ngOnInit(): void {
    
  }

  public onTabClick(selected: NavBarTab)
  {
    console.log('selected tab: ', selected);
    if(selected.link && selected.link !== "")
      this.router.navigateByUrl(selected.link);
    this.onTabClicked.emit(selected)
  }

  public getTabsComponent(): TabsNavBarComponent{
    return this.navTabs
  }
}
