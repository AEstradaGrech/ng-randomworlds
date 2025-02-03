import { NgModule } from "@angular/core";
import { HomeComponent } from "./pages/home/home.component";
import { RouterModule, Routes } from "@angular/router";
import { CharacterSelectionComponent } from "./pages/character-selection/character-selection.component";
import { WorldGeneratorComponent } from "./pages/world-generator/world-generator.component";
import { QuestViewComponent } from "./pages/quest-view/quest-view.component";

const routes: Routes =[
    {
        path: '',
        redirectTo:"prompting/chat",
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'character/select',
        component: CharacterSelectionComponent
    }, 
    {
        path: 'world/generator',
        component: WorldGeneratorComponent
    },
    {
        path: 'game/quest',
        component: QuestViewComponent
    }
]

@NgModule({ 
    imports: [
        RouterModule.forChild(routes),
    ],
    exports:[
        RouterModule
    ]
})

export class BussinessRoutingModule {};