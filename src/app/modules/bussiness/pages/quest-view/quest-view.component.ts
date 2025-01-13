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
  isLoading:boolean = false;
  hasStreamedScene:boolean = false;
  actionsBarConfig:Array<TreeMenuItem> = questViewSidebarConfig;
  panelStateR = 'hidden';
  panelStateL = 'hidden';
  gameData!:GameData;
  currentQuest!:RandomQuestDto;
  currentBlock!:QuestBlockDto | null; 
  selectedChoice!:string | null;
  endgameIcon:string = "mood"
  private _snackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _service: QuestsService = inject(QuestsService);
  private _currentBadChoice!:string;
  @ViewChild('scenebox') scenebox!:ElementRef;

  get hasGameOngoing():boolean{
    return this.gameData && this.gameData.gameSessionId !== '';
  }
  get hasFinishedQuest():boolean{
    return this.gameData && (this.gameData.gameStatus !== 'READY' && this.gameData.gameStatus !== 'INITIALIZING' && this.gameData.gameStatus !== 'ONGOING');
  }
  get questFinishedIcon():string{
    return this.endgameIcon;
  }
  ngOnInit(): void {
    let gameData = this._getGameData();
    if(gameData){
      if(gameData.gameType !== 'quest'){
        this._router.navigateByUrl('randomworlds/home');
        return;
      }
      this.gameData = gameData;
      //this.gameData.gameSessionId = '677ab56ed0260b9ab658ad9d';
    }  
    this.btnTxt = this.hasGameOngoing ? "SUBMIT" : "BEGIN"
    if(this.hasGameOngoing){
      this.isLoading = true;
      this._service.getById(this.gameData.gameSessionId).subscribe(res => {
        this.isLoading = false;
        this.currentQuest = res;
        if(this.currentQuest.blocks.length > 0){
          this.currentBlock = this.currentQuest.blocks.slice(-1)[0];
          this.sceneText = this.currentBlock.scene;
        }
        this.gameData.gameStatus = this.currentQuest.status;
        this.gameData.currentBlock = this.currentQuest.blocks.length;
      })
      //Quest.getById
      // render desc
      // render choices
    }
  }
 
  public onSubmit(){
    console.log('-- on submit --')
    if(this.hasGameOngoing && this.currentBlock){
      if(!this.selectedChoice || this.selectedChoice === '' ){
        this._snackBar.open("You must pick a choice from the available to continue", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
        return;
      }
      // if(this._currentBadChoice && this.selectedChoice.includes(this._currentBadChoice) && this._currentBadChoice.toUpperCase().includes("END_TYPE:")){
      //   this.selectedChoice = this.selectedChoice.replace("<<BAD CHOICE>>", "").trim(); //devonly
      // }
      this.currentBlock.choice=this.selectedChoice;
      this.currentQuest.blocks.push(this.currentBlock);
      this.currentBlock = null;
      this.isLoading = true;
      this.hasStreamedScene = false;
      this._service.handleQuestStream(this.currentQuest.id, this.currentQuest.blocks.slice(-1)[0]).subscribe(res => {
        if(this._handleResponseStream(res) ){
          if(!this.hasFinishedQuest){
            this._service.generateSceneOptions({id:this.gameData.gameSessionId, scene:this.sceneText}).subscribe(res => {
              this.isLoading=false; 
              if(this.currentBlock && res.options.length >0){
                this.gameData.currentBlock++;
                this.currentBlock.id = this.gameData.currentBlock;
                this.currentBlock.options = res.options;
                let badTag = res.bad_choice.toUpperCase().includes("END_TYPE:") ? "": " <<BAD CHOICE>>"
                this.currentBlock.options.push(`${res.bad_choice}${badTag}`)
                this._currentBadChoice = res.bad_choice;
              }
            }) 
          }
          else{
            if(!this.currentBlock) return;
            this.btnTxt = 'PLAY AGAIN';
            this.currentQuest.blocks.push(this.currentBlock);
            this.currentBlock = null;
            switch(this.gameData.gameStatus){
              case('COMPLETED'):
                this._snackBar.open("QUEST FINISHED!", undefined, { duration: 3000,panelClass: ['snack-success'], verticalPosition: 'bottom'});
              break;
              case('FAILED'):
                this._snackBar.open("GAME OVER", undefined, { duration: 3000,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
              break;
              case('UNCERTAIN'):
                this._snackBar.open("TO BE CONTINUED...", undefined, { duration: 3000,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
              break;
              default:
                break;
            }
            this._service.endQuest(this.currentQuest.id, this.gameData.gameStatus, this.currentQuest.blocks.slice(-1)[0]).subscribe(res => {
              this.currentQuest = res;
              this.isLoading=false; 
              this._snackBar.open("The current QUEST has ended. Mint it if you wish and play again!", undefined, { duration: 3000,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
            })
          }
        }
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
        if(this.choicesText.includes('QUEST FINISHED!')){
          this.currentBlock.choice = 'END QUEST';
          this.gameData.gameStatus = 'COMPLETED';
          this.currentQuest.status = 'COMPLETED';
          this._setEndgameIcon('FAILED');
          return true;
        }
        if(this.choicesText.includes('GAME OVER')){
          this.currentBlock.choice = 'END QUEST';
          this.gameData.gameStatus = 'FAILED';
          this.currentQuest.status = 'FAILED';
          this._setEndgameIcon('FAILED');
          return true;
        }
        if(this.choicesText.includes('TO BE CONTINUED...')){
          this.currentBlock.choice = 'END QUEST';
          this.gameData.gameStatus = 'UNCERTAIN';
          this.currentQuest.status = 'UNCERTAIN';
          this._setEndgameIcon('FAILED');
          return true;
        }
   
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
      this.currentBlock = {
        id: 0,//this.currentQuest ? this.currentQuest.blocks.length + 1 : 1, //Esto es para in memory historic (pag.data) pero es una ñapa. #TODO: if Blocks > 10
        scene:this.sceneText,
        options: [],
        choice:""
      }
      if(this.sceneText && this.sceneText !== ""){
        if(this.sceneText.includes('QUEST FINISHED!')){
          this.currentBlock.choice = 'END QUEST';
          this.gameData.gameStatus = 'COMPLETED';
          this.currentQuest.status = 'COMPLETED';
          this._setEndgameIcon('COMPLETED');
          return true;
        }
        if(this.sceneText.includes('GAME OVER')){
          this.currentBlock.choice = 'END QUEST';
          this.gameData.gameStatus = 'FAILED';
          this.currentQuest.status = 'FAILED';
          this._setEndgameIcon('FAILED');
          return true;
        }
        if(this.sceneText.includes('TO BE CONTINUED...')){
          this.currentBlock.choice = 'END QUEST';
          this.gameData.gameStatus = 'UNCERTAIN';
          this.currentQuest.status = 'UNCERTAIN';
          this._setEndgameIcon('UNCERTAIN');
          return true;
        }
      }
      return true;
      //return this._validateCurrentBlock();
    }
    this.streamedText = res["partialText"];
    if(this.streamedText)
        this.sceneText = this.streamedText; 
    return false;
  }

  private _getGameData():GameData | null{
      let gameDataCache = localStorage.getItem('game-data')
      return gameDataCache ? JSON.parse(gameDataCache) : null;
  }

  private _initializeQuest(){
    if(this.gameData.character && this.gameData.userPreferences){
      let req:QuestInitRequest = {
        username:this.gameData.username,
        charname:this.gameData.charname,
        charCollectionAddress:this.gameData.charCollectionAddress,
        charTokenId:this.gameData.charTokenId,
        character:this.gameData.character,
        preferences:this.gameData.userPreferences,
        isRandomCharacter:this.gameData.isRandomCharacter,
        maxBlocks:5
      }
      console.log('-- init req -- ', req);
      this.hasStreamedScene = false;
      this.sceneText = "";
      this.isLoading = true;
      this.gameData.gameStatus = 'INITIALIZING';
      this._service.initQuestStream(req).subscribe(res => {
        console.log('-- on response --', res)
        if(this._handleResponseStream(res) && this.currentBlock){
          this.gameData.currentBlock++;
          this.currentBlock.id = this.gameData.currentBlock;
          this.btnTxt = "SUBMIT";
          this._completeInitialization(req);
        }
      })
    }
    
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
        this._service.generateSceneOptions({id:this.gameData.gameSessionId, scene:this.sceneText}).subscribe(res => {
          this.isLoading=false; 
          if(this.currentBlock){
            this.currentBlock.options = res.options;
            this.currentBlock.options.push(`${res.bad_choice} <<BAD_CHOICE>>`)//devonly
            this._currentBadChoice = res.bad_choice;
            this._snackBar.open("Select your choice!", undefined, { duration: 2500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
            this._service.setQuestStatus(this.gameData.gameSessionId, 'ONGOING').subscribe(res => {
              this.currentQuest = res;
              this.gameData.gameStatus = this.currentQuest.status;
              localStorage.setItem('game-data', JSON.stringify(this.gameData))
              console.log('-- current intro --', this.currentQuest.intro)
            })
          }
        })
      }
      else this._snackBar.open("An error has occured while retrieving the new generated Quest", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
    })
  }

  private _setEndgameIcon(status:string){
    switch(status){
      case('FAILED'):
        this.endgameIcon = 'mood_bad';
      break;
      case('UNCERTAIN'):
        this.endgameIcon = 'sentiment_neutral';
      break;
      case('SUCCESS'):
      default:
        this.endgameIcon = 'mood';
    }
  }
}
