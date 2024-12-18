import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { NavBarTab } from '../../../shared/components/tabs-nav-bar/nav-bar-tab.model';
import { summarizeSessionNavBarConfig } from '../../../../core/constants/configs/header-navbar';
import { MatDialog } from '@angular/material/dialog';
import { ChatDocDto, EndSessionRequest, InitSessionRequest, SessionPromptRequest } from '../../../shared/models/prompting-interfaces'
import { PromptingService } from '../../services/prompting.service';
import { SessionsMgmtService } from '../../services/sessions-mgmt.service';
import { ChatSummaryRequest, ChatSummaryResponse, SessionDto, SessionHistoryUpdateRequest, SessionRetagRequest, SummaryDto } from '../../../shared/models/mgmt-interfaces';

import { HeaderNavbarComponent } from '../../../shared/components/header-navbar/header-navbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiSettingsService } from '../../services/api-settings.service';
import { LoadSummarizationMessageComponent } from './components/load-summarization-message/load-summarization-message.component';
import { SummarizedSessionReviewComponent } from './components/summarized-session-review/summarized-session-review.component';
import { SummariesMgmtService } from '../../services/summaries-mgmt.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SaveSummaryComponent } from './components/save-summary/save-summary.component';
import { SaveSysMessageComponent } from './components/save-sys-message/save-sys-message.component';
import { SysMsgMgmtService } from '../../services/sysmsgs-mgmt.service';

@Component({
  selector: 'app-summarize-session',
  templateUrl: './summarize-session.component.html',
  styleUrl: './summarize-session.component.scss'
})
export class SummarizeSessionComponent {
  @ViewChild('sysmsgbox') sysmsgbox!: ElementRef;
  @ViewChild('summarizationbox') summarizationbox!: ElementRef;
  @ViewChild('promptbox') promptbox!: ElementRef;
  @ViewChild('navTabs') navTabs!: HeaderNavbarComponent

  currentSession:SessionDto | null = null
  currentSummary!:ChatSummaryResponse
  promptText:string = ""
  
  sysMessageTag:string = ""
  originalSysMsg:string = ""
  currentSysMsg:string = ""
  currentSummaryText:string = ""
  summaryPromptText:string = ""
  
  showSettings:boolean = false
  selectedModel:string = "none"

  editSysMsgEnabled:boolean = false
  currentTab:string = 'Summarization message'
  
  isSummarizing:boolean = false
  
  loadSessionModalOpened:boolean = false
  saveSummaryMsgModalOpened:boolean = false
  loadSummaryMsgOpened:boolean = false
  
  form!:FormGroup
  public headBarConfig: Array<NavBarTab> = summarizeSessionNavBarConfig;
  dialog = inject(MatDialog);
  
  private _snackBar = inject(MatSnackBar);
  constructor(private service:SummariesMgmtService, private sysmsgMgmtService: SysMsgMgmtService, private apiSettingsService: ApiSettingsService, private fb:FormBuilder){}
  
  ngAfterViewInit(): void {
    this.navTabs.getTabsComponent().forceActive("Summarization message")
  }

  ngOnInit(): void {
    this.currentTab = 'Summarization message'
    this.form = this.fb.group({
      temperature: new FormControl(0.5),
      maxTokens: new FormControl(800),
      contextLength: new FormControl(2048)
    })
    this.apiSettingsService.getApiSettings().subscribe(res => {
      this.selectedModel = res["current_setup"]
    })
  }

  onExpanded(){
    this.showSettings = true;
  }
  onCollapsed(){
    this.showSettings = false;
  }
  onSaveCurrentSummary(){
    if(this.currentSummary){
      return;
    }
    if(this.currentSysMsg != this.originalSysMsg){

    }else{
      //let dto
    }
    // if currentSysMsg != loadedSysMsg -> SaveCurrentSysMsg (openmodal->afterClosed->saveSummary)
    // TODO: setAsCurrentSummary -> updatesSessio nDoc
    // else save
  }
  onSaveIconClick(){
    //if currentSysMsg != loadedSysMsg --> create then save
    let req: SummaryDto = {
      id:'',
      sysMessageTag: this.sysMessageTag,
      sysMessage: this.currentSummaryText,
      sessionId:this.currentSession?.id ?? '',
      chatId: this.currentSession?.current_chat_id ?? '',
      creationDate:'',
      prompt: this.summaryPromptText,
      summary: this.currentSummaryText,
      observations: []
    }
    if(this._isValidSaveRequest(req)){
      const dialogRef = this.dialog.open(SaveSummaryComponent, {
        data: req
      })
      
      dialogRef.afterClosed().subscribe(res => {
        if(res.success)
          this._snackBar.open("Session summary saved!", undefined, { duration: 2500, panelClass: 'snack-success'})
      })
    }
  }

  //onSummarize
  onSummarize(){
    let req:ChatSummaryRequest = {
      sysMessageTag:this.sysMessageTag,
      sessionId: this.currentSession?.id ?? '',
      maxTokens: this.form.get('maxTokens')?.value,
      temperature: this.form.get('temperature')?.value,
      contextLength: this.form.get('contextLength')?.value,
      excludeChatSysMsg:true
    }
    if(this._isValidRequest(req)){
      this.showSettings = false;
      this.isSummarizing = true;
      this.service.summarize(req).subscribe(res => {
        this.isSummarizing = false;
        this._snackBar.open("Session summarized!", undefined, { duration: 2500, panelClass: 'snack-success'});
        this.currentSummary = res;
        this.currentSummaryText = this.currentSummary.summary;
        this.summaryPromptText = this.currentSummary.prompt;
      })
    }
  }
  private _isValidRequest(req:ChatSummaryRequest) : boolean{
    if(req.sessionId === ''){
      this._snackBar.open("No session ID present in request", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    if(req.sysMessageTag === ''){
      this._snackBar.open("No summarization message tag selected", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    if(req.contextLength <= 0){
      this._snackBar.open("Context window length invalid", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    return true;
  }

  private _isValidSaveRequest(req:SummaryDto) : boolean{
    if(req.sessionId === ''){
      this._snackBar.open("No session ID present in request", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    if(req.sysMessageTag === ''){
      this._snackBar.open("No summarization message to save", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    if(req.sysMessage === ''){
      this._snackBar.open("No summarization message to save", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    if(req.prompt === ''){
      this._snackBar.open("No summary prompt text to save", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    if(req.summary === ''){
      this._snackBar.open("No summary text to save", undefined, { duration: 2500, panelClass: 'snack-warning'})
      return false;
    }
    return true;
  }

  onMenuTabClick(event:NavBarTab) {
    if(event.name !== "Summarization message"){
      if(this.editSysMsgEnabled){
        event.isActive = false
        this.navTabs.getTabsComponent().forceActive("Summarization message")
        this._snackBar.open("Disable the 'Edit Summarization message' mode to chat", undefined, { duration: 2000, panelClass: 'snack-warning'})
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
      if(this.currentTab === "Summary"){
        this.currentTab = "Summarization message"
        this.navTabs.getTabsComponent().forceActive("Summarization message")
      }
    }
  }

  onLoadSessionToggle(event:any){
    if(event.checked){
      this.loadSessionModalOpened = true
      const dialogRef = this.dialog.open(SummarizedSessionReviewComponent, {
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadSessionModalOpened = false
        if(result){
          console.log('-- ON SUMMARIZED SESSION SELECT --', result)
          this.currentSession = result;
        } 
      })
    }

  }

  //onLoadSysMsgToggle
  onLoadSysMsgToggle(event:any){
    console.log('on Load Sys Msg')
    this.loadSummaryMsgOpened = event.checked;
    if(this.loadSummaryMsgOpened){
      const dialogRef = this.dialog.open(LoadSummarizationMessageComponent,{});
      dialogRef.afterClosed().subscribe(result => {
        console.log('on select summarization msg result', result);
        if(result){
          this.sysMessageTag = result.tag;
          this.originalSysMsg = result.message;
          this.currentSysMsg = this.originalSysMsg;
        } 
        this.loadSummaryMsgOpened = false;
      })
    }
    // // search-input + display (como load session)
  }

  onSaveCurrentSysMsgToggle(event:any){
    console.log('on Save Current As Profile')
    this.saveSummaryMsgModalOpened = event.checked;
    if(this.saveSummaryMsgModalOpened){
      this.loadSessionModalOpened = false;
      this.loadSessionModalOpened = false;
      const dialogRef = this.dialog.open(SaveSysMessageComponent, { data: {
        systemMessage:this.currentSysMsg
      }})
      dialogRef.afterClosed().subscribe(result => {
        this.saveSummaryMsgModalOpened = false;
        if(result.success)
          this._snackBar.open("Summarization message saved!", undefined, { duration: 2000, panelClass: 'snack-success'})
      })
    }
  }

  onUpdateSysMsg(){
    if(this.editSysMsgEnabled)
      this.currentSysMsg = this.sysmsgbox.nativeElement.value
  }
  onShowOriginalSysMsg(event:any){
    console.log(event)
    if(this.currentTab === 'Summarization message'){
      if(event.checked){
        this.sysmsgbox.nativeElement.value = this.originalSysMsg
      }
      else{
        this.sysmsgbox.nativeElement.value = this.currentSysMsg
      }
    }
  }
}

