import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NavBarTab } from '../tabs-nav-bar/nav-bar-tab.model';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  @Input() tabs!: Array<NavBarTab>;
  @Output() onTabClicked: EventEmitter<NavBarTab> = new EventEmitter<NavBarTab>();

  private readonly _authService:AuthService = inject(AuthService);

  ngOnInit(): void {
    this.onTabClicked.subscribe(tab => {
      this.tabs.forEach(x => x.onClickSub.next(tab.name));
    })
  }

  public connectedWallet = computed(() => {
    const user = this._authService.userLogin();
    return user ? user.username : null;
  })

  public onTabClick(tab: NavBarTab){
    this.onTabClicked.emit(tab);
  }

  public forceActiveTab(name:string){
    const tab = this.tabs.find(x => x.name === name);
    if(tab)
      tab.onClickSub.next(name);    
  }
}
