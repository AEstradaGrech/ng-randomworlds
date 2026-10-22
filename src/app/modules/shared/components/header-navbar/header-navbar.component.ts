import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, ViewChild } from '@angular/core';
import { NavBarTab } from '../tabs-nav-bar/nav-bar-tab.model';
import { Router } from '@angular/router';
import { TabsNavBarComponent } from '../tabs-nav-bar/tabs-nav-bar.component';


@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrl: './header-navbar.component.scss'
})
export class HeaderNavbarComponent implements OnInit {
  private readonly DEFAULT_LOGO = 'assets/images/RandomWorldsLogo.png';
  @ViewChild('navTabs') navTabs!: TabsNavBarComponent
  @Input() config!: Array<NavBarTab>;
  @Input() height: string = '240px'
  @Input() withLogo: boolean = true;
  @Input() logoUrl:string | null = null;

  @Output() onTabClicked: EventEmitter<NavBarTab> = new EventEmitter<NavBarTab>()
  
  logoImage = signal<string>(this.DEFAULT_LOGO);
  router:Router = inject(Router);
  
  ngOnInit(): void {
    if(this.withLogo && this.logoUrl){
      const logo = this.logoUrl;
      this.logoImage.update(v => v = logo);
    }
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
