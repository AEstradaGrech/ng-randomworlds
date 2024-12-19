import { NgModule } from "@angular/core";
import { HomeComponent } from "./pages/home/home.component";
import { RouterModule, Routes } from "@angular/router";
import { ChatComponent } from "./pages/chat/chat.component";
import { ImageGenComponent } from "./pages/image-gen/image-gen.component";
import { ImageReviewComponent } from "./pages/image-review/image-review.component";
import { SystemMessagesComponent } from "./pages/system-messages/system-messages.component";
import { ChatsReviewComponent } from "./pages/chats-review/chats-review.component";
import { SessionsReviewComponent } from "./pages/sessions-review/sessions-review.component";
import { SummarizeSessionComponent } from "./pages/summarize-session/summarize-session.component";
import { SummarizeTextComponent } from "./pages/summarize-text/summarize-text.component";
import { CharacterSelectionComponent } from "./pages/character-selection/character-selection.component";

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
        path: 'prompting/chat',
        component: ChatComponent
    },
    {
        path: 'prompting/summarize/text',
        component: SummarizeTextComponent
    },
    {
        path: 'prompting/image',
        component: ImageGenComponent
    },
    {
        path: 'review/sessions',
        component: SessionsReviewComponent
    },
    {
        path: 'review/chats',
        component: ChatsReviewComponent
    },
    {
        path: 'review/images',
        component: ImageReviewComponent
    },
    {
        path: 'mgmt/system-messages',
        component: SystemMessagesComponent
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