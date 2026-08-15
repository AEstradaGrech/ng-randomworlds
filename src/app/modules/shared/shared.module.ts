import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeMenuComponent } from './components/tree-menu/tree-menu.component';
import { AppLogoComponent } from './components/app-logo/app-logo.component';
import { GenericButtonComponent } from './components/generic-button/generic-button.component';
import { TabsNavBarComponent } from './components/tabs-nav-bar/tabs-nav-bar.component';
import { HeaderNavbarComponent } from './components/header-navbar/header-navbar.component';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { NftVisorComponent } from './components/nft-visor/nft-visor.component';
import { RoundedButtonComponent } from './components/rounded-button/rounded-button.component';
import { NotificationsComponent } from './components/notification/notification.component';
import { DragAndDropComponent } from './components/drag-and-drop/drag-and-drop.component';
import { TokenSelectorMatmenuComponent } from './components/token-selector-matmenu/token-selector-matmenu.component';

@NgModule({
    //components, directives, and pipes that belong exclusively to this particular module
    declarations:[TreeMenuComponent, AppLogoComponent, GenericButtonComponent, TabsNavBarComponent, HeaderNavbarComponent, SideNavbarComponent, SearchInputComponent, NftCardComponent, NftVisorComponent, RoundedButtonComponent, NotificationsComponent, DragAndDropComponent, TokenSelectorMatmenuComponent],
    imports:[
        CommonModule,
        FormsModule, 
        ReactiveFormsModule, 
        RouterModule, 
        MaterialModule
    ],
    //This exposes it so that other modules can get to it
    exports:[
        CommonModule,
        FormsModule, 
        ReactiveFormsModule, 
        RouterModule, 
        MaterialModule,
        TreeMenuComponent,
        TabsNavBarComponent,
        AppLogoComponent,
        GenericButtonComponent,
        HeaderNavbarComponent, 
        SideNavbarComponent,
        MatSnackBarModule,
        SearchInputComponent,
        NftCardComponent,
        NftVisorComponent,
        RoundedButtonComponent,
        DragAndDropComponent,
        TokenSelectorMatmenuComponent
    ],
    //A provider is an instruction to the Dependency Injection system on how to obtain a value for a dependency.
    providers:[]
})

export class SharedModule {};