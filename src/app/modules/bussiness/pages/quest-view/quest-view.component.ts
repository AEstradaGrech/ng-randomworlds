import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { questViewSidebarConfig } from 'src/app/core/constants/configs/side-navbar';
import { TreeMenuItem } from 'src/app/modules/shared/components/tree-menu/tree-menu-item.model';
import { GameData, QueryCondition, SortedFilter } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router'
import { QuestsService } from '../../services/quests.service';
import { QuestBlockDto, QuestInitRequest, RandomQuestDto } from 'src/app/core/interfaces/business/prompting.interface';
@Component({
  selector: 'app-quest-view',
  templateUrl: './quest-view.component.html',
  styleUrl: './quest-view.component.scss',
  animations: [
    trigger('panelStateL', [
      state('visible', style({ width: '*', opacity: 1 })),
      state('hidden', style({ width: '0', opacity: 0, overflow: 'hidden' })),
      transition('* => visible', animate('300ms ease-in')),
      transition('* => hidden', animate('300ms ease-out'))
    ]),
    trigger('panelStateR', [
      state('visible', style({ width: '*', opacity: 1 })),
      state('hidden', style({ width: '0', opacity: 0, overflow: 'hidden' })),
      transition('* => visible', animate('300ms ease-in')),
      transition('* => hidden', animate('300ms ease-out'))
    ])
  ]
})
export class QuestViewComponent implements OnInit {
  btnTxt:string = "BEGIN";
  sceneText!:string;
  choicesText!:string;
  streamedText!:string;
  isStreamingOn:boolean = false;
  hasStreamedScene:boolean = false;
  actionsBarConfig:Array<TreeMenuItem> = questViewSidebarConfig;
  panelStateR = 'hidden';
  panelStateL = 'hidden';
  gameData!:GameData;
  currentQuest!:RandomQuestDto;
  currentBlock!:QuestBlockDto | null; 
  selectedChoice!:string | null;
  private _snackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _service: QuestsService = inject(QuestsService);
  @ViewChild('scenebox') scenebox!:ElementRef;

  get hasGameOngoing():boolean{
    return this.gameData && this.gameData.gameSessionId !== "";
  }

  ngOnInit(): void {
    let gameData = this._getGameData();
    if(gameData){
      if(gameData.gameType !== 'quest'){
        this._router.navigateByUrl('randomworlds/home');
        return;
      }
      this.gameData = gameData;
    }  
    this.btnTxt = this.hasGameOngoing ? "SUBMIT" : "BEGIN"
  }
 
  public onSubmit(){
    console.log('-- on submit --')
    if(this.hasGameOngoing && this.currentBlock){
      if(!this.selectedChoice || this.selectedChoice === '' ){
        this._snackBar.open("You must pick a choice from the available to continue", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
        return;
      }
      this.currentBlock.choice=this.selectedChoice;
      this.currentQuest.blocks.push(this.currentBlock);
      this.currentBlock = null;
      this.isStreamingOn = true;
      this._service.handleQuest(this.currentQuest.id, this.currentQuest.blocks.slice(-1)[0]).subscribe(res => {
        if(this._handleResponseStream(res) && this.currentBlock){
          this.gameData.currentBlock++;
          this.currentBlock.id = this.gameData.currentBlock; 
        }
        else this._snackBar.open("An error has occured while streaming the next SCENE", undefined, { duration: 2500,panelClass: ['snack-success-warning'], verticalPosition: 'bottom'});
      })
    }
    else this._initializeQuest()
    
  }
  private _validateCurrentBlock() : boolean{
    if(this.sceneText && this.sceneText !== ""){
      if(this.choicesText && this.choicesText !== ""){
        this.currentBlock = {
          id: 0,//this.currentQuest ? this.currentQuest.blocks.length + 1 : 1, //Esto es para in memory historic (pag.data) pero es una ñapa. #TODO: if Blocks > 10
          scene:this.sceneText,
          options: [],
          choice:""
        }
        this.choicesText = this.choicesText.replace("<<OPTIONS>>", "");
        this.choicesText.trim();
        console.log('-- trimed choices text --', this.choicesText);
        let options = this.choicesText.split('OPTION:');
        console.log('-- options split --', options);
        options.forEach(option => {
          let value = option.trim();
          if(value && value !== "")
            this.currentBlock?.options.push(value);
        })
        return this.currentBlock.options.length > 0;
      }
    }
    return false;
  }
  onOpenBtnClick(btn:string){
    if(btn === 'left'){
      console.log('-- on left click --')
      this.panelStateL = (this.panelStateL === 'visible') ? 'hidden' : 'visible';
    }else{
      console.log('-- on right btn click --')
      this.panelStateR = (this.panelStateR === 'visible') ? 'hidden' : 'visible';
    }
  }

  private _handleResponseStream(res:any) : boolean{
    if(res.status === 200){
      this.isStreamingOn=false;   
      return this._validateCurrentBlock();
    }
    this.streamedText = res["partialText"];
    if(this.streamedText){
      if(!this.hasStreamedScene){
        if(this.streamedText.includes("<<")){
          this.hasStreamedScene = true;
          this.streamedText = this.streamedText.replace("<<", "")
        }
        this.sceneText = this.streamedText;
      }
      else this.choicesText = this.streamedText.replace(this.sceneText, ""); 
    } 
    return false;
  }

  private _getGameData():GameData | null{
      let gameDataCache = localStorage.getItem('game-data')
      return gameDataCache ? JSON.parse(gameDataCache) : null;
  }

  private _initializeQuest(){
    let req:QuestInitRequest = {
      username:this.gameData.username,
      charname:this.gameData.charname,
      charCollectionAddress:this.gameData.charCollectionAddress,
      charTokenId:this.gameData.charTokenId,
      charInfo:this.gameData.charInfo,
      ambiences:this.gameData.userPreferences["ambiences"],
      genres:this.gameData.userPreferences["genres"],
      moods:this.gameData.userPreferences["moods"],
      suggestion:this.gameData.userPreferences["suggestion"],
      constraints:this.gameData.userPreferences["constraints"],
      maxBlocks:10
    }
    console.log('-- init req -- ', req);
    this.hasStreamedScene = false;
    this.sceneText = "";
    this.isStreamingOn = true;
    this.gameData.gameStatus = 'INITIALIZING';
    this._service.initQuest(req).subscribe(res => {
      console.log(res)
      if(this._handleResponseStream(res) && this.currentBlock){
        this._snackBar.open("Select your choice!", undefined, { duration: 2500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
        this.gameData.currentBlock++;
        this.currentBlock.id = this.gameData.currentBlock;
        this._completeInitialization(req);
      }
    })
  }
  private _completeInitialization(req:QuestInitRequest){
    let conditions:QueryCondition[] = []
    const vars = Object.keys(req)
    vars.forEach((v:string) => {
      switch(v){
        case("username"):
        case("charname"):
        case("charTokenId"):
        case("charCollectionAddress"):
          conditions.push({field:v, value:req[v]})
        break;
        default: break;
      }
    })
    console.log('-- conditions --', conditions)
    let filter: SortedFilter = {
      conditions:conditions,
      page:0,
      page_size:1,
      sort_var:'creationDate',
      is_descending:true
    }
    this._service.sortedQuery(filter).subscribe(res => {
      if(res.data.length > 0){
        this.currentQuest = res.data[0];
        this.gameData.gameSessionId = this.currentQuest.id;
        localStorage.setItem('game-data', JSON.stringify(this.gameData));
        console.log('game-data',this.gameData);
        this._service.setQuestStatus(this.gameData.gameSessionId, 'ONGOING').subscribe(res => {
          this.currentQuest = res;
          this.gameData.gameStatus = this.currentQuest.status;
          localStorage.setItem('game-data', JSON.stringify(this.gameData))
        })
      }
      else this._snackBar.open("An error has occured while retrieving the new generated Quest", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
    })
  }
}
