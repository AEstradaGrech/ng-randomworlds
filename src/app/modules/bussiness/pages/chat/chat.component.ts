import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { NavBarTab } from '../../../shared/components/tabs-nav-bar/nav-bar-tab.model';
import { chatSessionNavBarConfig } from '../../../../core/constants/configs/header-navbar';
import { MatDialog } from '@angular/material/dialog';
import { InitSessionDialogComponent } from './components/init-session-dialog/init-session-dialog.component';
import { ChatDocDto, EndSessionRequest, InitSessionRequest, SessionPromptRequest } from '../../../shared/models/prompting-interfaces'
import { PromptingService } from '../../services/prompting.service';
import { SessionsMgmtService } from '../../services/sessions-mgmt.service';
import { SessionDto, SessionHistoryUpdateRequest, SessionRetagRequest } from '../../../shared/models/mgmt-interfaces';
import { v4 as uuidv4 } from 'uuid';
import { HeaderNavbarComponent } from '../../../shared/components/header-navbar/header-navbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiSettingsService } from '../../services/api-settings.service';
import { LoadSessionDialogComponent } from './components/load-session-dialog/load-session-dialog.component';
import { SaveCurrentDialogComponent } from './components/save-current-dialog/save-current-dialog.component';
import { LoadProfileDialogComponent } from './components/load-profile-dialog/load-profile-dialog.component';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('sysmsgbox') sysmsgbox!: ElementRef;
  @ViewChild('chatbox') chatbox!: ElementRef;
  @ViewChild('promptbox') promptbox!: ElementRef;
  @ViewChild('navTabs') navTabs!: HeaderNavbarComponent

  currentSession:SessionDto | null = null
  currentChatText:string = ""
  chatText:string = ""
  currentResponseStream:string = ""
  promptText:string = ""
  
  originalSysMsg:string = ""
  currentSysMsg:string = ""
  lastPromptedSysMsg:string = ""
  newUserPrompt:string = ""
  showSettings:boolean = false
  currentModel:string = "ollama/llama2-uncensored"

  editSysMsgEnabled:boolean = false
  currentTab:string = 'Chat'
  isSessionOn:boolean = false
  isStreamingOn:boolean = false
  btnText = "Init"
  loadSessionModalOpened:boolean = false
  saveProfileModalOpened:boolean = false
  loadProfileModalOpened:boolean = false
  private _currentChatTurn:any[] = []
  private _chatHistory:any[]=[]
  public headBarConfig: Array<NavBarTab> = chatSessionNavBarConfig;
  dialog = inject(MatDialog);
  
  private _snackBar = inject(MatSnackBar);
  constructor(private promptingService:PromptingService, private sessionsMgmtService: SessionsMgmtService, private apiSettingsService: ApiSettingsService){}
  
  ngAfterViewInit(): void {
    this.navTabs.getTabsComponent().forceActive("System message")
  }

  ngOnInit(): void {
    this.currentTab = 'System message'
    this.isSessionOn = false //TODO: conservar session state en localstorage y recuperar datos + displayChatTab
    this.btnText = "Init"
    this.apiSettingsService.getApiSettings().subscribe(res => {
      this.currentModel = res["current_setup"]
    })
  }

  onExpanded(){
    this.showSettings = true;
  }
  onCollapsed(){
    this.showSettings = false;
  }
  onPowerIconClick(){
    this.showSettings = false;
    if(this.isStreamingOn){
      return;
    }
    if(this.currentSession){
      let req:EndSessionRequest = {
        session_id: this.currentSession.id,
        should_trigger_on_background: true,
        should_trigger_full_summary: false,
        should_update_session: false,
        exclude_chat_sys_msg:true,
        max_tokens: 800,
        temperature: 0.5
      }
      this.promptingService.endSession(req).subscribe(res => {
        this._snackBar.open("Session chat finished!", undefined, { duration: 1000,panelClass: ['snack-success'], verticalPosition: 'top'})
        this.currentSession = null
        this.isSessionOn = false
        this.currentChatText =""
        this.currentResponseStream = ""
        this.currentSysMsg = ""
        this.lastPromptedSysMsg = ""
        this.promptText = ""
        this._chatHistory = []
        this._currentChatTurn = []
        this.btnText = "Init"
        if(this.currentTab === "Chat"){
          this.currentTab = "System message"
          this.navTabs.getTabsComponent().forceActive("System message") 
        }
      })
    }
    
  }
  onUserPrompt(){
    this.promptText = this.promptbox.nativeElement.value
    if(this.promptText === "") {
      this._snackBar.open("Type something to prompt", undefined, { duration: 1000, panelClass: 'snack-warning'})
      return;
    } 
    try{
      this.newUserPrompt = this.promptText;
      this.promptText = ""
      this.promptbox.nativeElement.value = ""
      if(this.currentSession !== null){
        this._setUserChatTurn();
        this._historyToText(this._currentChatTurn, true);
        this.showSettings = false;
        this.isSessionOn = true;
        this.isStreamingOn = true;
        this._handleSessionPrompt()
      }
      else this._handleInitSession() 
    }catch(error){
      this.isSessionOn = false;
      this.isStreamingOn = false;
      this._snackBar.open("An error has occured while making the request...", undefined, { duration: 2000, panelClass: 'snack-warning'})
    }
    
  }
  private _setUserChatTurn(){
    this._currentChatTurn = []
      if(this.lastPromptedSysMsg !== this.currentSysMsg && this.currentSysMsg !== this.originalSysMsg){
        this.lastPromptedSysMsg = this.currentSysMsg;
        this._currentChatTurn.push({'system': this.lastPromptedSysMsg})
      }
      this._currentChatTurn.push({"user": this.newUserPrompt})
  }

  private _handleInitSession(){
    const dialogRef = this.dialog.open(InitSessionDialogComponent, {
      data: {
        systemMessage: this.currentSysMsg,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result.valid){
        let req:InitSessionRequest = {
          username:result.username,
          tag:result.tag,
          system_message: this.currentSysMsg,
          message: this.newUserPrompt,
          temperature:2.0,
          max_tokens:600,
          chat_history:[]
        }
        if(req.system_message === "")
          req.system_message = "You are a helpful assistant" //CHECK: lo gestiona la api (model_provider). Tambien lo necesito aqui para pintar original sys_msg
        if(req.username === "")
          req.username = "Developer"
        if(req.tag ===""){
          req.tag = `UnknownBot-${uuidv4().toString()}`
        }
        req.tag += `-${req.username}`
        console.log(req)
        this.originalSysMsg = req.system_message;
        this._setUserChatTurn();
        this._historyToText(this._currentChatTurn);
        this.chatText += ("\n" + "- Assistant: ")
        this.currentChatText = this.chatText;
        this.isStreamingOn = true;
        this.showSettings = false;
        this.promptingService.initSessionStream(req)
          .subscribe(res => {
            if(!this.isSessionOn)
              this._snackBar.open("Session chat initialized!", undefined, { duration: 1000,panelClass: ['snack-success'], verticalPosition: 'top'})
            this.isSessionOn = true;
            this.btnText = "Prompt"
            if(this._handleChatResponseStream(res)){
              console.log("--ON STREAM HANDLED--")
              this.originalSysMsg = req.system_message
              this.lastPromptedSysMsg = this.originalSysMsg;
              this.currentSysMsg = this.lastPromptedSysMsg;
              this.sessionsMgmtService.getLastSessionWithTag(req.tag).subscribe(res => {
                this.currentSession = res
                this._updateChatTurn();
              })
            }
          })
      }
      else{
        this.isStreamingOn = false;
        this.isSessionOn = false;
      }
    });
  }
  private _handleSessionPrompt(){
    if(this.currentSession){
      this.chatText += ("\n" + "- Assistant: ")
      this.currentChatText = this.chatText;
      let req:SessionPromptRequest = {
        session_id:this.currentSession.id,
        user_message: this.newUserPrompt,
        system_message:this.currentSysMsg
      }
      this.newUserPrompt = req.user_message;
      this.promptingService.sessionPromptStream(req).subscribe(res => {
        if(this.btnText === 'Init'){
          this._snackBar.open("Continuing chat session!", undefined, { duration: 1500,panelClass: ['snack-success'], verticalPosition: 'top'})
          this.isSessionOn = true;
          this.btnText = "Prompt"
        }
        if(this._handleChatResponseStream(res)){
          this._updateChatTurn()
        }
      })
    }
  }
  private _updateChatTurn(){
    if(this.currentSession){
      let updateReq:SessionHistoryUpdateRequest = {
        session_id: this.currentSession.id,
        chat_history: this._currentChatTurn
      }
      this.sessionsMgmtService.updateSessionChat(updateReq).subscribe(res => {
        this._chatHistory = res
      })
    }
    
  }
  private _handleChatResponseStream(res:any) : boolean{
    if(res.status === 200){
      this.currentChatText += "\n"
      this.chatText = this.currentChatText;
      this._currentChatTurn.push({"assistant": this.currentResponseStream})
      this.isStreamingOn=false;   
      return true;
    }
    let updatedText = res["partialText"]
    if(updatedText !== undefined)
      this.currentResponseStream = updatedText
      let final = this.chatText + this.currentResponseStream
      this.currentChatText = final
      this.chatbox.nativeElement.value = this.currentChatText
      this.isStreamingOn = true;
      this.promptText = ""
      return false
  }

  onMenuTabClick(event:NavBarTab) {
    if(event.name === "Chat"){
      if(this.editSysMsgEnabled){
        event.isActive = false
        this.navTabs.getTabsComponent().forceActive("System message")
        this._snackBar.open("Disable the 'Edit System message' mode to chat", undefined, { duration: 2000, panelClass: 'snack-warning'})
        return
      }
      this.onShowOriginalSysMsg({"checked": false})
    }
    this.currentTab = event.name
  }
  onEditSystemMessageToggle(event:any){
    console.log(event)
    this.editSysMsgEnabled = event.checked
    if(!this.editSysMsgEnabled){
      this.sysmsgbox.nativeElement.value = this.currentSysMsg
    }
    else{
      if(this.currentTab === "Chat"){
        this.currentTab = "System message"
        this.navTabs.getTabsComponent().forceActive("System message")
      }
      this.onShowOriginalSysMsg({"checked": false})
    }
  }

  onLoadSessionToggle(event:any){
    if(event.checked){
      this.loadSessionModalOpened = true
      const dialogRef = this.dialog.open(LoadSessionDialogComponent, {
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadSessionModalOpened = false
        if(result){
          this.currentSession = result;
          this.sessionsMgmtService.getSessionChatById(result.current_chat_id)
            .subscribe((res: ChatDocDto) => {
              if(res.messages.length > 0){
                let sysMsg = res.messages[0]
                this.currentSysMsg = sysMsg[Object.keys(sysMsg)[0]]
                this.originalSysMsg = this.currentSysMsg;
                this.lastPromptedSysMsg = this.originalSysMsg;               
                let totalChat =res.messages.filter(x => x[Object.keys(x)[0]] !== sysMsg['system']);
                let lastChatSysMsg = this._getLastChatSysMsg(totalChat)
                if(lastChatSysMsg){
                  this.lastPromptedSysMsg = lastChatSysMsg['system']
                  this.currentSysMsg = this.lastPromptedSysMsg;
                }
                this._historyToText(totalChat)
                this.currentTab = 'System message';
                this.navTabs.getTabsComponent().forceActive("System message")
              }
          })
        } 
      })
    }

  }

  onLoadProfileToggle(event:any){
    console.log('on From profile')
    this.loadProfileModalOpened = event.checked;
    if(this.loadProfileModalOpened){
      const dialogRef = this.dialog.open(LoadProfileDialogComponent,{})
      dialogRef.afterClosed().subscribe(result => {
        console.log('on select profile result', result)
        if(result){
          this.currentSysMsg = result.description
        } 
        this.loadProfileModalOpened = false;
      })
    }
    // search-input + display (como load session)
  }
  onSaveCurrentAsProfileToggle(event:any){
    console.log('on Save Current As Profile')
    this.saveProfileModalOpened = event.checked;
    if(this.saveProfileModalOpened){
      const dialogRef = this.dialog.open(SaveCurrentDialogComponent, { data: {
        systemMessage:this.originalSysMsg
      }})
      dialogRef.afterClosed().subscribe(result => {
        this.saveProfileModalOpened = false;
        console.log('save result',result)
        if(result.isSuccessful){
          console.log('success!')
          if(this.currentSession){
            let retagReq: SessionRetagRequest = {
              session_id: this.currentSession?.id, 
              tag: `${result.profileName}-${this.currentSession?.username}`,
              retag_chats: true
            } 
            this.sessionsMgmtService.retagSession(retagReq)
              .subscribe(res => {
                this._snackBar.open("New profile saved. Continuing chat session!", undefined, { duration: 2000,panelClass: ['snack-success'], verticalPosition: 'top'})
            }) 
          }
        }else{
          console.log('not success')
        }
      })
    }
    //review, retag & save
  }
  private _getLastChatSysMsg(history: any[]){
    let msg = null;
    for(let i = 0; i< history.length; i++){
      let key = Object.keys(history[i])[0];
      if(key === 'system')
        msg = history[i];
    } 
    return msg;
  }
  onUpdateSysMsg(){
    if(this.editSysMsgEnabled)
      this.currentSysMsg = this.sysmsgbox.nativeElement.value
  }
  onShowOriginalSysMsg(event:any){
    console.log(event)
    if(event.checked){
      this.sysmsgbox.nativeElement.value = this.originalSysMsg
    }
    else{
      this.sysmsgbox.nativeElement.value = this.currentSysMsg
    }
  }

  private _historyToText(history:any[], isAppend:boolean = false){
    let text = isAppend? this.currentChatText : ''
    history.forEach(kvp => {
      console.log(kvp)
      let key = Object.keys(kvp)[0];
      let prefix = ''
      switch(key){
        case 'system':
          prefix = '\n### CONTEXTUAL: '
          break;
        case 'user' :
          prefix = '\n- User: '
          break;
        case 'assistant' :
          prefix = '\n- Assistant: '
          break;
      }
      if(key === 'system'){
        let msg = kvp[key].replace('[ctx-update]: ', '')
        text += (prefix + `(... ${msg})` + '\n')
      }
      else text += (prefix + kvp[key] + '\n')
    })
    this.chatText = text
    this.currentChatText = this.chatText;
  }
}
