import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericButtonComponent } from './components/generic-button/generic-button.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { NftVisorComponent } from './components/nft-visor/nft-visor.component';
import { RoundedButtonComponent } from './components/rounded-button/rounded-button.component';
import { NotificationsComponent } from './components/notification/notification.component';
import { DragAndDropComponent } from './components/drag-and-drop/drag-and-drop.component';
import { TokenSelectorMatmenuComponent } from './components/token-selector-matmenu/token-selector-matmenu.component';
import { ShellModule } from './shell.module';

@NgModule({
    //components, directives, and pipes that belong exclusively to this particular module
    declarations:[
        GenericButtonComponent,  
        SearchInputComponent, 
        NftCardComponent, 
        NftVisorComponent, 
        RoundedButtonComponent, 
        NotificationsComponent,
        DragAndDropComponent, 
        TokenSelectorMatmenuComponent
    ],
    imports:[
        FormsModule, 
        ReactiveFormsModule, 
        MaterialModule,
        ShellModule
    ],
    //This exposes it so that other modules can get to it
    exports:[
        FormsModule, 
        ReactiveFormsModule, 
        MaterialModule,
        ShellModule,
        GenericButtonComponent,
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