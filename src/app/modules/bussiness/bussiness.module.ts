import { NgModule } from '@angular/core';
import { BussinessRoutingModule } from './bussiness-module.routing';
import { HomeComponent } from './pages/home/home.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CharacterSelectionComponent } from './pages/character-selection/character-selection.component';
import { WorldGeneratorComponent } from './pages/world-generator/world-generator.component';
import { QuestViewComponent } from './pages/quest-view/quest-view.component';
import { AdventureViewComponent } from './pages/adventure-view/adventure-view.component';
import { MarketplaceComponent } from './pages/marketplace/marketplace.component';



@NgModule({
    declarations: [
        HomeComponent,
        CharacterSelectionComponent,
        WorldGeneratorComponent,
        QuestViewComponent,
        AdventureViewComponent,
        MarketplaceComponent
    ],
    imports:[
        CommonModule,
        RouterModule,
        MaterialModule,
        SharedModule,
        BussinessRoutingModule
    ],
    exports:[
        CommonModule,
        RouterModule
    ]
})

export class BussinessModule {};