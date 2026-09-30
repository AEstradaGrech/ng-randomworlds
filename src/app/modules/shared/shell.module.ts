import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDivider } from '@angular/material/divider'
import { HeaderNavbarComponent } from './components/header-navbar/header-navbar.component';
import { TreeMenuComponent } from './components/tree-menu/tree-menu.component';
import { AppLogoComponent } from './components/app-logo/app-logo.component';
import { TabsNavBarComponent } from './components/tabs-nav-bar/tabs-nav-bar.component';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';


@NgModule({
    declarations:[ 
        HeaderNavbarComponent,
        TreeMenuComponent,
        AppLogoComponent, 
        TabsNavBarComponent, 
        SideNavbarComponent
    ],
    imports: [
        CommonModule,
        RouterModule, 
        MatListModule,
        MatIconModule,
        MatDivider 
    ],
    exports:[
        CommonModule,
        RouterModule, 
        MatListModule,
        MatIconModule,
        MatDivider,
        HeaderNavbarComponent,
        TreeMenuComponent,
        AppLogoComponent, 
        TabsNavBarComponent, 
        SideNavbarComponent
    ]
})

export class ShellModule {};