import { NgModule } from '@angular/core';
import { BussinessRoutingModule } from './bussiness-module.routing';
import { HomeComponent } from './pages/home/home.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ImageGenComponent } from './pages/image-gen/image-gen.component';
import { ImageReviewComponent } from './pages/image-review/image-review.component';
import { SystemMessagesComponent } from './pages/system-messages/system-messages.component';
import { SysMsgDetailComponent } from './pages/system-messages/components/sys-msg-detail/sys-msg-detail.component';
import { ChatsReviewComponent } from './pages/chats-review/chats-review.component';
import { ChatDetailDialogComponent } from './pages/chats-review/components/chat-detail-dialog/chat-detail-dialog.component';
import { SessionsReviewComponent } from './pages/sessions-review/sessions-review.component';
import { SessionChatsReviewComponent } from './pages/sessions-review/components/session-chats-review/session-chats-review.component';
import { SummarizeSessionComponent } from './pages/summarize-session/summarize-session.component';
import { SummarizeTextComponent } from './pages/summarize-text/summarize-text.component';
import { SummarizedSessionReviewComponent } from './pages/summarize-session/components/summarized-session-review/summarized-session-review.component';
import { LoadSummarizationMessageComponent } from './pages/summarize-session/components/load-summarization-message/load-summarization-message.component';
import { SaveSysMessageComponent } from './pages/summarize-session/components/save-sys-message/save-sys-message.component';
import { SaveSummaryComponent } from './pages/summarize-session/components/save-summary/save-summary.component';
import { CharacterSelectionComponent } from './pages/character-selection/character-selection.component';
import { WorldGeneratorComponent } from './pages/world-generator/world-generator.component';
import { QuestViewComponent } from './pages/quest-view/quest-view.component';
import { AdventureViewComponent } from './pages/adventure-view/adventure-view.component';



@NgModule({
    declarations: [
        HomeComponent,
        ImageGenComponent,
        ImageReviewComponent,
        SystemMessagesComponent,
        SysMsgDetailComponent,
        ChatsReviewComponent,
        ChatDetailDialogComponent,
        SessionsReviewComponent,
        SessionChatsReviewComponent,
        SummarizeSessionComponent,
        SummarizeTextComponent,
        SummarizedSessionReviewComponent,
        LoadSummarizationMessageComponent,
        SaveSysMessageComponent,
        SaveSummaryComponent,
        CharacterSelectionComponent,
        WorldGeneratorComponent,
        QuestViewComponent,
        AdventureViewComponent
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