import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, DestroyRef, ElementRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { questsViewSidebarConfig } from 'src/app/core/constants/configs/side-navbar';
import { TreeMenuItem } from 'src/app/modules/shared/components/tree-menu/tree-menu-item.model';
import { GameData, QueryCondition, SortedFilter } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router'
import { QuestsService } from '../../services/quests.service';
import { FinalOptionsResponse, QuestBlockDto, QuestCharacter, NewQuestRequest, QuestPreferences, RandomQuestDto, InitQuestRequest } from 'src/app/core/interfaces/business/prompting.interface';
import { SideNavbarComponent } from 'src/app/modules/shared/components/side-navbar/side-navbar.component';
import { catchError, of } from 'rxjs';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { replaceEndpoint } from 'src/app/core/constants/configs/nft-card';

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
export class QuestViewComponent extends BaseComponent implements OnInit, OnDestroy {
  btnTxt:string = "BEGIN";
  sceneText!:string;
  choicesText!:string;
  streamedText!:string;
  isLoading:boolean = false;
  hasStreamedScene:boolean = false;
  actionsBarConfig:Array<TreeMenuItem> = [...questsViewSidebarConfig];
  panelStateR = 'hidden';
  panelStateL = 'hidden';
  gameData!:GameData;
  currentQuest!:RandomQuestDto;
  currentBlock!:QuestBlockDto | null;
  currentChoices: string[] = []; 
  selectedChoice!:string | null;
  endgameIcon:string = "mood"
  storyText:string = "";
  charImageUrl:string = '';
  
  private _snackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _service: QuestsService = inject(QuestsService);
  private _destroyRef: DestroyRef = inject(DestroyRef);
  
  @ViewChild('scenebox') scenebox!:ElementRef;
  @ViewChild('sideBar') sideBar!:SideNavbarComponent;
  
  platformId: Object = inject(PLATFORM_ID);

  get hasGameOngoing():boolean{
    return this.gameData && this.gameData.gameSessionId !== '' && !this.hasFinishedQuest;
  }
  get hasFinishedQuest():boolean{
    return this.gameData && this.gameData.gameStatus !== 'READY' && this.gameData.gameStatus !== 'INITIALIZING' && this.gameData.gameStatus !== 'ONGOING';
  }
  get questFinishedIcon():string{
    return this.endgameIcon;
  }

  @HostListener('window:storage', ['$event'])
  onSelectedCharacterChange(event: StorageEvent){
    console.log('-- WORLD GENERATOR >> ON CHARACTER CHANGE >> STORAGE EVENT', event);
    if(event.key === 'game-data')
      this._setupGameData();
  }
  @HostListener('window:beforeunload', ['$event']) 
  onBeforeCloseTab(event:any){
    console.log('BEFORE UNLOAD EVENT');
    this._clearGameData();
  }
  @HostListener('window:unload', ['$event']) 
  onCloseTab(event:any){
    console.log('BEFORE UNLOAD EVENT');
    this._clearGameData();
  }

  ngOnInit(): void {
    this._setupGameData();
  }
  ngOnDestroy(): void {   
    this._clearGameData();
  }

  public onSubmit(){
    console.log('-- on submit --')
    if(this.btnTxt === 'PLAY AGAIN'){
      this._setForNewGame();
      return;
    }
    if(this.hasGameOngoing && this.currentBlock){
      if(!this.selectedChoice || this.selectedChoice === '' ){
        this._snackBar.open("You must pick a choice from the available to continue", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
        return;
      }
      
      if(this.selectedChoice){
        if(this.currentQuest.blocks.length < this.currentQuest.maxBlocks -1){
          let taggedOption = this.currentBlock.options.find(x => x.includes(this.selectedChoice ?? ''))
          if(this.currentQuest.blocks.length < this.currentQuest.maxBlocks -2) {
            if(taggedOption && taggedOption.includes("<<BAD_CHOICE>>"))
              this.selectedChoice = taggedOption; //pasar el tag para el LLM
          }
          else{
            if(taggedOption)
              this.selectedChoice = taggedOption;
          }
        }
        this.currentBlock.choice=this.selectedChoice;
        this.currentQuest.blocks.push(this.currentBlock);
        this._handleQuest();
      }
    }
    else this._initializeQuest()
    
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
  public onMenuSelect(event:TreeMenuItem){
    console.log('-- questview - on menu click --', event)
    this._switchMenu(event.name);
  }
  
  private _setupGameData() {
    this.sceneText = '';
    this.storyText = '';
    let gameData = this._getGameData();
    if(gameData){
      gameData.isLocked = true;
      localStorage.setItem('game-data', JSON.stringify(gameData));
      if(!this._isValidGameData(gameData)){
        this._router.navigateByUrl('randomworlds/home');
        return;
      }
      this.gameData = gameData;
      this.charImageUrl = `url(${replaceEndpoint(this.gameData.selectedCharacter?.image ?? '', 'IPFS', 'ALCHEMY')}`;
    }  
    this.btnTxt = this.hasGameOngoing ? "SUBMIT" : "BEGIN"
    if(this.hasGameOngoing){
      this._setOngoingSession();
    }
    else {
      this._switchMenu('Intro');
      if(this.sideBar)
        this.sideBar.setMenuEnabled('Intro');
      if(this.gameData && this.gameData.selectedCharacter && this.gameData.character && this.gameData.userPreferences){
        let req:NewQuestRequest = {
          username:this.gameData.username,
          charCollectionAddress:this.gameData.selectedCharacter.contractAddress,
          charTokenId:`${this.gameData.selectedCharacter.tokenId}`,
          character:this.gameData.character,
          preferences:this.gameData.userPreferences as QuestPreferences,
          intro:this.gameData.intro,
          isRandomCharacter:this.gameData.isRandomCharacter,
          maxBlocks:5
        }
        this._service.saveNewQuest(req)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(res => {
            this.currentQuest = res;
        });
      }
    }
  }

  private _isValidGameData(data: GameData){
    console.log('-- IS VALID DATA --', data);
    if(data.gameType !== 'quest') return false;
    if(!data.character) return false;
    if(!data.selectedCharacter) return false;
    if(!data.username) return false;
    return true;
  }

    private _clearGameData(){
    // Skip on the SERVER only (no localStorage on Node). ngOnDestroy runs during
    // SSR teardown, so without this the server render crashes. Note the `!`:
    // the browser MUST run this, or the cross-tab lock never clears.
    if(!isPlatformBrowser(this.platformId)) return;
    console.log('CLEARING GAME DATA');
    let currentData:GameData | null = this._getGameData();
    let data: GameData ={
      username: currentData ? currentData.username : '',
      gameType: 'quest',
      gameStatus: "READY",
      charname:'',
      selectedCharacter:undefined,
      character:undefined,
      isRandomCharacter:false,
      gameSessionId:'',
      userPreferences:undefined,
      intro:"",
      currentBlock:0,
      isLocked: false
    }
    localStorage.setItem('game-data', JSON.stringify(data))
  }

  private _switchMenu(name:string){
    switch(name){
      case('Preferences'):
        if(this.gameData){
          this.sceneText = this.gameData.userPreferences as string ? 
            this.gameData.userPreferences as string :
            this._formatUserPreferences(this.gameData.userPreferences as QuestPreferences);
        }
        break;
      case('Character'):
        if(this.gameData.character)
          this.sceneText = this._formatCharacterData(this.gameData.character)
        break;
      case('Intro'):
        this.sceneText = this.gameData.intro;
        break;
      case('Story'):
        this.sceneText = this.storyText;
        break;
      default: 
        let split = name.split(' ');
        if(split.length > 1){
          if(this.currentBlock && parseInt(split[1].trim()) === this.currentBlock.id){
            this.sceneText = this.currentBlock.scene;
            this.currentChoices = this._getSanitizedOptions(this.currentBlock.options);
            break;
          }
          let block = this.currentQuest.blocks.filter(x => x.id === parseInt(split[1].trim()));
          if(block !== undefined && block.length > 0 && block[0].id !== this.currentQuest.maxBlocks){
            this.sceneText = `> SCENE: ${block[0].scene}\n\n> CHOICE: ${this._getSanitizedOption(block[0].choice ?? '')}`;
            this.currentChoices = this._getSanitizedOptions(block[0].options);
            this.selectedChoice = block[0].choice;
          }
        }
        
      break;
    }
  }

  private _getSanitizedOptions(options:string[]){
    let sanitized:string[] = []
    options.forEach(option => sanitized.push(this._getSanitizedOption(option)));
    return sanitized;
  }
  private _getSanitizedOption(option:string){
    if(option.length == 0) return "";
    option = this._tryClearTag(option, '<<HAPPY>>');
    option = this._tryClearTag(option, '<<GAME_OVER>>');
    option = this._tryClearTag(option, '<<UNCERTAIN>>');
    option = this._tryClearTag(option, '<<BAD_CHOICE>>');
    return option;
  }

  private _tryClearTag(option:string, tag:string): string{
    return option.includes(tag) ? option.replace(tag, "").trim() : option;
  }

  private _updateCurrentQuest(){
    this._service.getById(this.currentQuest.id).subscribe(res => {
      this.currentQuest = res;
      if(this.currentQuest.blocks.length > 0){
        this.storyText = "";
        this.currentQuest.blocks.forEach(block => {
          this.storyText += `${block.summary}\n\n`
        });
        this.storyText += `QUEST ${this.currentQuest.status}`
      }
    })
  }
  private _handleResponseStream(res:any) : boolean{
    if(res.status === 200){  
      this.currentBlock = {
        id: 0,//this.currentQuest ? this.currentQuest.blocks.length + 1 : 1, //Esto es para in memory historic (pag.data) pero es una ñapa. #TODO: if Blocks > 10
        scene:this.sceneText,
        options: [],
        choice:"",
        summary:""
      }
      return true;
    }
    this.streamedText = res["partialText"];
    if(this.streamedText)
        this.sceneText = this.streamedText; 
    return false;
  }

  private _setOngoingSession(){
    console.log('-- HAS GAME ONGOING --')
      this.isLoading = true;
      this._service.getById(this.gameData.gameSessionId)
      .pipe(catchError(error => {
        this.isLoading = false;
        return of(error);
      }))
      .subscribe(res => {
        this.isLoading = false;
        if(!this._isValidResponse(res)) return;
        this.currentQuest = res;
        if(this.currentQuest.blocks.length > 0){
          this.currentBlock = this.currentQuest.blocks.slice(-1)[0];
          this.sceneText = this.currentBlock.scene;
          this.currentChoices = this.currentBlock.options.map(opt => this._tryClearTag(opt, '<<BAD_CHOICE>>'));
          this.currentQuest.blocks.forEach(x => {
            this._addSceneMenuOption(x.id);
            this.storyText += `${x.summary}\n\n`
          });
        }
        this.gameData.gameStatus = this.currentQuest.status;
        this.gameData.currentBlock = this.currentQuest.blocks.length;
        if(this.hasFinishedQuest)
          this.btnTxt = "PLAY AGAIN";
      })
  }
  private _setForNewGame(){
    this.sceneText = '';
    this.storyText = '';
    this.gameData.gameSessionId = '';
    this.actionsBarConfig = [...questsViewSidebarConfig];
    this.currentBlock = null;
    this.currentChoices = [];
    this.btnTxt = "BEGIN";
    this.gameData.gameStatus = 'READY';
    this.gameData.currentBlock = 0;
  }
  private _handleQuestStreamEnd(res:any){
    if(this.currentQuest.blocks.length < this.currentQuest.maxBlocks -1){
      if(this.currentQuest.blocks.length < this.currentQuest.maxBlocks -2)
        this._generateDefaultSceneOptions();
      else this._generateFinalSceneOptions();
    }
    else{
      console.log('-- ON BLOCK LIMIT REACHED >> LAST CHOICE -->', this.currentQuest.blocks.slice(-1)[0].choice);
      this._handleEndgameDisplay(this.currentQuest.blocks.slice(-1)[0].choice);
      this._handleQuestEnd();
    }
  }

  private _generateDefaultSceneOptions(){
    this._service.generateSceneOptions({id:this.gameData.gameSessionId, scene:this.sceneText})
      .pipe(catchError(error => {
        this.isLoading = false;
        return of(error);
      }))
      .subscribe(res => {
        this.isLoading=false;
        if(!this._isValidResponse(res)) return; 
        if(this.currentBlock && res.options.length >0){
          this.gameData.currentBlock++;
          localStorage.setItem('game-data', JSON.stringify(this.gameData));
          this.currentBlock.id = this.gameData.currentBlock;
          this.currentBlock.options = [...res.options];
          let badTag = "<<BAD_CHOICE>>"
          this.currentBlock.options.push(`${res.bad_choice} ${badTag}`);
          this.currentChoices = [...res.options];
          this.currentChoices.push(res.bad_choice);
          this._addSceneMenuOption(this.currentBlock.id);
          this._updateCurrentQuest();
        }
      }) 
  }

  private _generateFinalSceneOptions(){
    this._service.generateFinalOptions({id:this.gameData.gameSessionId, scene:this.sceneText})
      .pipe(catchError(error => {
        this.isLoading = false;
        return of(error);
      }))
      .subscribe(res => {
        this.isLoading=false;
        if(!this._isValidResponse(res)) return; 
        if(this.currentBlock && res as FinalOptionsResponse){
          this.gameData.currentBlock++;
          localStorage.setItem('game-data', JSON.stringify(this.gameData));
          this.currentBlock.id = this.gameData.currentBlock;
          let finalOptions: string[] = [
            res.happy_end_choice,
            res.uncertain_end_choice,
            res.game_over_choice
          ]
          this.currentChoices = finalOptions;
          this.currentBlock.options = [
            `${res.happy_end_choice} <<HAPPY>>`,
            `${res.uncertain_end_choice} <<UNCERTAIN>>`,
            `${res.game_over_choice} <<GAME_OVER>>`
          ];
          
          this._addSceneMenuOption(this.currentBlock.id);
          this._updateCurrentQuest();
        }
      }) 
  }

  private _handleQuestEnd(){
    if(!this.currentBlock) return;
    this.gameData.currentBlock++;
    localStorage.setItem('game-data', JSON.stringify(this.gameData));
    this.currentBlock.id = this.gameData.currentBlock;
    this.currentChoices = [];
    this._addSceneMenuOption(this.currentBlock.id);
    this._updateCurrentQuest();
    this.btnTxt = 'PLAY AGAIN';
    this.currentQuest.blocks.push(this.currentBlock);
    this.currentBlock = null;
    switch(this.gameData.gameStatus){
      case('COMPLETED'):
        this._snackBar.open("QUEST FINISHED!", undefined, { duration: 3500,panelClass: ['snack-success'], verticalPosition: 'bottom'});
      break;
      case('FAILED'):
        this._snackBar.open("GAME OVER", undefined, { duration: 3500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
      break;
      case('UNCERTAIN'):
        this._snackBar.open("TO BE CONTINUED...", undefined, { duration: 3500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
      break;
      default:
        break;
    }
    this._service.endQuest(this.currentQuest.id, this.gameData.gameStatus, this.currentQuest.blocks.slice(-1)[0])
    .pipe(catchError(error => {
      this.isLoading = false;
      return of(error);
    }))
    .subscribe(res => {
      this.isLoading=false; 
      if(!this._isValidResponse(res)) return;
      this.currentQuest = res;
      this._snackBar.open("The current QUEST has ended. Mint it if you wish and play again!", undefined, { duration: 3000,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
      this._updateCurrentQuest();
    })
  }
  private _handleQuest(){ 
    this.currentBlock = null;
    this.isLoading = true;
    this.hasStreamedScene = false;
    this._service.handleQuestStream(this.currentQuest.id, this.currentQuest.blocks.slice(-1)[0])
    .pipe(catchError(error => {
      this.isLoading = false;
      return of(error);
    }))
    .subscribe(res => {
      if(this._isValidResponse(res) && this._handleResponseStream(res) ){
        if(!this.hasFinishedQuest){
          this._handleQuestStreamEnd(res);
        }
        else{
          this._handleQuestEnd();
        }
      }
    })
  }

  private _getGameData():GameData | null{
      if(!isPlatformBrowser(this.platformId)) return null;
      let gameDataCache = localStorage.getItem('game-data')
      return gameDataCache ? JSON.parse(gameDataCache) : null;
  }

  private _initializeQuest(){
    //if(this.gameData.character && this.gameData.userPreferences && this.gameData.selectedCharacter){
      if(this.currentQuest){
      let req:InitQuestRequest = {
        questId: this.currentQuest.id,
        username:this.gameData.username,
        charCollectionAddress:this.currentQuest.charCollectionAddress,
        charTokenId:`${this.currentQuest.charTokenId}`
      }
      console.log('-- init req -- ', req);
      this.hasStreamedScene = false;
      this.sceneText = "";
      this.isLoading = true;
      this.gameData.gameStatus = 'INITIALIZING';
      this._service.initQuestStream(req)
        .pipe(catchError(error => { 
          this.isLoading = false; 
          this.gameData.gameStatus = 'READY';
          return of(error);
        }))
        .subscribe((res: any | Error) => {
          console.log('-- on response --', res);
          if(this._isValidResponse(res)){
            if(this._handleResponseStream(res) && this.currentBlock){
              this.gameData.currentBlock++;
              this.currentBlock.id = this.gameData.currentBlock;
              this._addSceneMenuOption(this.currentBlock.id);
              this.btnTxt = "SUBMIT";
              this._completeInitialization(req);
            }
          }
        })
    } 
  }
  private _completeInitialization(req:InitQuestRequest){
    let conditions:QueryCondition[] = []
    const vars = Object.keys(req);
    vars.forEach((v:string) => {
      switch(v){
        case("charTokenId"):
          conditions.push({field:v, value:req[v] as any});
          break;
        case("username"):
        case("charCollectionAddress"):
          conditions.push({field:v, value:req[v]} as any)
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
    this._service.sortedQuery(filter)
    .pipe(catchError(error => {
      this.isLoading = false;
      this.gameData.gameStatus = 'READY';
      this.btnTxt = "BEGIN";
      return of(error);
    }))
    .subscribe(res => {
      console.log('-- on sorted query -- response', res);
      if(this._isValidResponse(res)){
        if(res.data.length > 0){
          this.currentQuest = res.data[0];
          this.gameData.gameSessionId = this.currentQuest.id;
          localStorage.setItem('game-data', JSON.stringify(this.gameData));
          console.log('game-data',this.gameData);
          if(this.currentQuest.blocks.length < this.currentQuest.maxBlocks){
            this._service.generateSceneOptions({id:this.gameData.gameSessionId, scene:this.sceneText})
            .pipe(catchError(error => {
              this.isLoading = false;
              this.gameData.gameStatus = 'READY';
              this.btnTxt = "BEGIN";
              return of(error);
            }))
            .subscribe(res => {
              this.isLoading=false;
              if(!this._isValidResponse(res)) return; 
              if(this.currentBlock){
                this.currentBlock.options = [...res.options];
                this.currentBlock.options.push(`${res.bad_choice} <<BAD_CHOICE>>`);
                this.currentChoices = [...res.options];
                this.currentChoices.push(res.bad_choice);
                this._snackBar.open("Select your choice!", undefined, { duration: 2500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
                this._service.setQuestStatus(this.gameData.gameSessionId, 'ONGOING')
                .pipe(catchError(error => {
                  this.isLoading = false;
                  this.gameData.gameStatus = 'READY';
                  this.btnTxt = "BEGIN";
                  return of(error);
                }))
                .subscribe(res => {
                  this.currentQuest = res;
                  this.gameData.gameStatus = this.currentQuest.status;
                  localStorage.setItem('game-data', JSON.stringify(this.gameData));
                  console.log('-- current intro --', this.currentQuest.intro);
                })
              }
            })
          }
          else{
            console.log('-- ON BLOCK LIMIT REACHED >> LAST CHOICE -->', this.currentQuest.blocks.slice(-1)[0].choice);
            this._handleEndgameDisplay(this.currentQuest.blocks.slice(-1)[0].choice);
            this._handleQuestEnd();
            //save block
          }
        }
        else this._snackBar.open("An error has occured while retrieving the new generated Quest", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});   
      }
    })
  }

  private _handleEndgameDisplay(lastChoice: string | null){
    if(this.currentBlock && lastChoice){
      let choiceToUpper = lastChoice.toUpperCase();
      if(choiceToUpper.includes("<<HAPPY>>")){
        this.currentBlock.scene += "\n\nQUEST COMPLETED!";
        this.sceneText += "\n\nQUEST COMPLETED!";
        this.currentBlock.choice = 'END QUEST';
        this.gameData.gameStatus = 'COMPLETED';
        this.currentQuest.status = 'COMPLETED';
        this._setEndgameIcon('COMPLETED');
      }
      if(choiceToUpper.includes("<<GAME_OVER>>")){
      this.currentBlock.scene += "\n\nGAME OVER";
        this.sceneText += "\n\nGAME OVER";
        this.currentBlock.choice = 'END QUEST';
        this.gameData.gameStatus = 'FAILED';
        this.currentQuest.status = 'FAILED';
        this._setEndgameIcon('FAILED');
      }
      if(choiceToUpper.includes("<<UNCERTAIN>>")){
        this.currentBlock.scene += "\n\nTO BE CONTINUED...";
        this.sceneText += "\n\nTO BE CONTINUED...";
        this.currentBlock.choice = 'END QUEST';
        this.gameData.gameStatus = 'UNCERTAIN';
        this.currentQuest.status = 'UNCERTAIN';
        this._setEndgameIcon('UNCERTAIN');
      }
    }
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
  private _addSceneMenuOption(sceneId:number){
    this.actionsBarConfig.push(new TreeMenuItem(`Scene ${sceneId}`, 2, undefined, false, false, true, undefined))
  }

  private _formatUserPreferences(data:QuestPreferences): string{
    return `
AMBIENCES: ${data.ambiences}

MOODS: ${data.moods}

GENRES: ${data.genres}

CONSTRAINTS: ${data.constraints ?? 'NONE'}

SUGGESTION: ${data.suggestion ?? 'NONE'}`
  }
  private _formatCharacterData(data: QuestCharacter):string{
    return `
NAME: ${data.name}

AGE: ${data.age}

APPEREANCE: ${data.appereance}

BACKGROUND: ${data.background}

PERSONALITY: ${data.personality}

MOTIVATIONS: ${data.motivations}

ICONIC MOMENT: ${data.iconicMoment}

REMARKABLE COMMENT: ${data.comment}`
  }
}
