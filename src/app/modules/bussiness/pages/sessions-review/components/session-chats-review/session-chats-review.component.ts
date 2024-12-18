import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatPromptsMgmtService } from '../../../../services/chat-prompts-mgmt.service';
import { MatInput } from '@angular/material/input';
import { HeaderNavbarComponent } from '../../../../../shared/components/header-navbar/header-navbar.component';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';
import { NavBarTab } from '../../../../../shared/components/tabs-nav-bar/nav-bar-tab.model';
import { sessionChatsReviewNavBarConfig } from '../../../../../../core/constants/configs/header-navbar';
import { SessionDto } from '../../../../../shared/models/mgmt-interfaces';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QueryCondition, QueryFilter } from '../../../../../shared/models/common-interfaces';
import { ChatDocDto } from '../../../../../shared/models/prompting-interfaces';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SummariesMgmtService } from '../../../../services/summaries-mgmt.service';
import { SessionsMgmtService } from '../../../../services/sessions-mgmt.service';

@Component({
  selector: 'app-session-chats-review',
  templateUrl: './session-chats-review.component.html',
  styleUrl: './session-chats-review.component.scss'
})
export class SessionChatsReviewComponent implements OnInit, AfterViewInit {
  currentChatText!:string;
  sessionId!:string
  systemMessage!:string;
  currentChatSummary!:string;
  username!:string;
  messageTag!:string;
  currentTab:string = 'System message';
  headBarConfig: Array<NavBarTab> = sessionChatsReviewNavBarConfig;
  data:SessionDto = inject(MAT_DIALOG_DATA);
  sessionChats: ChatDocDto[] = [];
  currentChat!:ChatDocDto;
  totalRecords: number = 0;
  
  private _snackBar = inject(MatSnackBar);
  private _service = inject(ChatPromptsMgmtService);
  private _sessionService = inject(SessionsMgmtService)
  private _summariesService = inject(SummariesMgmtService)
  private _filter!:QueryFilter;

  @ViewChild('sysmsgbox') sysmsgbox!: ElementRef;
  @ViewChild('chatbox') chatbox!: ElementRef;
  @ViewChild('summarybox') summarybox!: ElementRef;
  @ViewChild('tagInput') tagInput!: MatInput;
  @ViewChild('usernameInput') usernameInput!: MatInput;
  @ViewChild('sessionsInput') sessionsInput!: SearchInputComponent;
  @ViewChild('navTabs') navTabs!: HeaderNavbarComponent
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit(): void {
    console.log('-- session data -- ', this.data)
    this.sessionId = this.data.id;
    this.username = this.data.username;
    this.messageTag = this.data.tag;
    this.systemMessage = '';
    this.currentChatText = '';
    this._filter = {
      conditions: [],
      page:0,
      page_size:0
    }
    
  }

  ngAfterViewInit(): void {
    this.navTabs.getTabsComponent().forceActive('System message')
    this.paginator.pageSize = 1;
    this._initialLoad()
  }

  get canSetAsCurrentChat(){
    return this.currentChat && this.data.current_chat_id !== this.currentChat.id
  }

  submit(){
    console.log('-- on submit --')
    this._sessionService.setCurrentChat(this.sessionId, this.currentChat.id).subscribe(res => {
      this._snackBar.open("Current chat set as current!", undefined, { duration: 2500, panelClass: 'snack-success-uncen'})
      this.data = res;
    })
    
  }

  onMenuTabClick(event:any){
    console.log('-- on menu tab click --')
    this.currentTab = event.name
  }

  onSessionSelected(event:any){
    console.log('-- on session selected --')
  }

  onPaginationChange(event: PageEvent){
    console.log('-- onPagEvent--', event)
    if(this.sessionChats.length > 0){
      this._setCurrentChat(this.sessionChats[event.pageIndex])
    }
  }

  private _historyToText(messages:any[]){
    messages.forEach(m => {
      let key = Object.keys(m)[0]
      let textTag:string = ''
      let msg = m[key];
      switch (key.toLocaleLowerCase()){
        case('system'):
          textTag = "- [CONTEXTUAL]: "
          msg = `(${msg.replace('[ctx-update]:', '')} )`
          break;
        case('user'):
          textTag = "- User:"
          break;
        case('assistant'):
          textTag = "- Assistant:"
          break;
      }
      this.currentChatText += `\n${textTag} ${msg}\n`
    })
  }

  //get all
  private _initialLoad(){
    let conditions:QueryCondition[] = [{
      field:'sessionId',
      value: this.data.id
    }]
    this._filter.conditions = conditions
    this._filter.page_size = 0
    this._filter.page = 0
    this._service.query(this._filter).subscribe(res => {
      this.sessionChats = res.data ?? []
      this.totalRecords = res.total_records ?? 999999;
      this.paginator.pageIndex = this._filter.page;
      if(this.sessionChats.length > 0)
        this._setCurrentChat(this.sessionChats[0])
    })
  }
  private _setCurrentChat(chat:ChatDocDto){
    this.systemMessage = chat.messages[0]['system'];
    this.currentChatText = '';
    this.currentChat = chat;
    this._historyToText(this.currentChat.messages.slice(1))
    if(this.currentChat.id !== this.data.current_chat_id)
      this._summariesService.getByChatId(this.currentChat.id).subscribe(res => {
        this.currentChatSummary = res.summary;
      })
    else this.currentChatSummary = this.data.summary;
  }
}
