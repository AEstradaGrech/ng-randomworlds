import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ChatDocDto } from '../../../../../shared/models/prompting-interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NavBarTab } from '../../../../../shared/components/tabs-nav-bar/nav-bar-tab.model';
import { chatSessionNavBarConfig } from '../../../../../../core/constants/configs/header-navbar';
import { SearchInputConfig } from '../../../../../shared/components/search-input/search-input-config';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInput } from '@angular/material/input';
import { HeaderNavbarComponent } from '../../../../../shared/components/header-navbar/header-navbar.component';
import { ChatPromptsMgmtService } from '../../../../services/chat-prompts-mgmt.service';
import { SessionsMgmtService } from '../../../../services/sessions-mgmt.service';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-chat-detail-dialog',
  templateUrl: './chat-detail-dialog.component.html',
  styleUrl: './chat-detail-dialog.component.scss'
})
export class ChatDetailDialogComponent implements OnInit, AfterViewInit {
 
  data:ChatDocDto = inject(MAT_DIALOG_DATA);
  
  sessionId!:string
  showParams:boolean = false;
  isEditing:boolean = false;
  currentChatText!:string;
  systemMessage!:string;
  username!:string;
  messageTag!:string;
  currentTab:string = 'System Message'
  headBarConfig: Array<NavBarTab> = chatSessionNavBarConfig;
  searchConfig = new SearchInputConfig('session/containing-tag', 'GET', 'tag', 'Session Tag')
  private _snackBar = inject(MatSnackBar);
  private _service = inject(ChatPromptsMgmtService)
  constructor(public dialogRef: MatDialogRef<ChatDetailDialogComponent>){}
  @ViewChild('sysmsgbox') sysmsgbox!: ElementRef;
  @ViewChild('chatbox') chatbox!: ElementRef;
  @ViewChild('tagInput') tagInput!: MatInput;
  @ViewChild('usernameInput') usernameInput!: MatInput;
  @ViewChild('sessionsInput') sessionsInput!: SearchInputComponent;
  @ViewChild('navTabs') navTabs!: HeaderNavbarComponent

  ngOnInit(): void {

    this.sessionId = this.data.sessionId ?? 'None';
    this.username = this.data.username;
    this.messageTag = this.data.tag;
    console.log('-- data -- ', this.data.messages[0]['system'])
    this.systemMessage = this.data.messages[0]['system'];
    this.currentChatText = '';
    this._historyToText(this.data.messages.slice(1))
  }
  ngAfterViewInit(): void {
    this.navTabs.getTabsComponent().forceActive('Chat')
  }
  onExpanded(){
    console.log('--on expanded--')
    this.showParams = true;
  }

  onCollapsed(){
    console.log('-- on collapsed --')
    this.showParams = false;
  }

  submit(){
    console.log('-- on submit --')

    this.data.messages = []
    this.data.messages.push({'system': this.systemMessage})
    let history = this._textToHistory()
    this.data.messages = [...this.data.messages, ...history]
    //console.log('-- history from text -- ', this.data.m)
    let dto:ChatDocDto = {
      id: this.data.id,
      username:this.username,
      tag:this.messageTag,
      model:this.data.model,
      temperature:this.data.temperature,
      maxTokens:this.data.maxTokens,
      messages: this.data.messages,
      sessionId:this.data.sessionId
    } 

    console.log('-- DTO --', dto)
    this._service.update(dto).subscribe(res => {
      console.log(res)
      this._snackBar.open("Document updated!", undefined, { duration: 2500, panelClass: 'snack-success-uncen'})
      this.dialogRef.close({success: true})
    })
  }

  onEditToggle(event:any){
    console.log('-- on edit --')
    this.isEditing = event.checked;
  }

  onMenuTabClick(event:any){
    console.log('-- on menu tab click --')
    this.currentTab = event.name
  }

  onSessionSelected(event:any){
    console.log('-- on session selected --')
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

  private _textToHistory(): any[]{
    this.currentChatText = this.chatbox.nativeElement.value;
    this.currentChatText = this.currentChatText.replace(/- User:/gi, '[MSG] - User:')
    this.currentChatText = this.currentChatText.replace(/- Assistant:/gi, '[MSG] - Assistant:')
    this.currentChatText = this.currentChatText.replace(/- [CONTEXTUAL]:/gi, '[MSG] - System:')
    let split = this.currentChatText.split('[MSG]')
    let history:any = []
    split.forEach(msg => {
      if(msg.includes("- User: ")){
        let msgSplit = msg.split("- User:")
        history.push({"user": msgSplit[1].trim()})
      }
      if(msg.includes("- Assistant: ")){
        let msgSplit = msg.split("- Assistant:")
        history.push({"assistant": msgSplit[1].trim()})
      }
      if(msg.includes("- System: ")){
        let msgSplit = msg.split("- System:")
        history.push({"system": msgSplit[1].trim()})
      }
    })
    return history
  }
}
