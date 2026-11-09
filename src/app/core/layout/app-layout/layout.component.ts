import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { TreeMenuItem } from '../../../modules/shared/components/tree-menu/tree-menu-item.model';
import { NavBarTab } from '../../../modules/shared/components/tabs-nav-bar/nav-bar-tab.model';
import { mainNavBarConfig } from '../../constants/configs/header-navbar';
import { HeaderNavbarComponent } from 'src/app/modules/shared/components/header-navbar/header-navbar.component';
import { NavBarComponent } from 'src/app/modules/shared/components/nav-bar/nav-bar.component';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from 'src/app/modules/shared/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements AfterViewInit {

  public authService: AuthService = inject(AuthService);
  private _notificationService: NotificationService = inject(NotificationService);
  private _destroyRef: DestroyRef = inject(DestroyRef);

  @ViewChild('navbar') navbar!: NavBarComponent;
  
  ngAfterViewInit(): void {
    this.navbar.forceActiveTab('Play'); // TODO: active tab from url
    this.authService.onSessionTimeoutWarn
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(warn =>{
        if(warn)
          this._notificationService.push('Your session is about to expire, refresh it to keep playing', this.authService.expireTimeout);
      })
  }


  public headBarConfig: Array<NavBarTab> = mainNavBarConfig;
}
