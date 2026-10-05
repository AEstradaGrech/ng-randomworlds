import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, DestroyRef, ElementRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { questsViewSidebarConfig } from 'src/app/core/constants/configs/side-navbar';
import { TreeMenuItem } from 'src/app/modules/shared/components/tree-menu/tree-menu-item.model';
import { GameData, QueryCondition, SortedFilter } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router'
import { QuestsService } from '../../services/quests.service';
import { FinalOptionsResponse, QuestBlockDto, QuestCharacter, NewQuestRequest, QuestPreferences, RandomQuestDto, InitQuestRequest, EndGameRequest, SceneOptionsResponse } from 'src/app/core/interfaces/business/prompting.interface';
import { SideNavbarComponent } from 'src/app/modules/shared/components/side-navbar/side-navbar.component';
import { catchError, defer, filter, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { ESnackAlertType, GameOutcome } from 'src/app/modules/shared/models/common-enums';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { PlayerGameSession } from '../../models/smart-contract.interfaces';
import { HttpEventType } from '@angular/common/http';

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
  private _isGameRecovery: boolean = false;
  private _snackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _service: QuestsService = inject(QuestsService);
  private _destroyRef: DestroyRef = inject(DestroyRef);
  private _web3Service: SmartContractsService = inject(SmartContractsService);
  
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
  get didGameInit():boolean {
    return this.gameData && this.gameData.gameStatus !== 'INITIALIZING';
  }

  public collectionLogoImg(imgUrl: string):string{
    return imgUrl === '' ? 
    'url(assets/images/RandomWorldsLogo.png)' :
    replaceEndpoint(imgUrl, 'IPFS', 'ALCHEMY');
  }

  @HostListener('window:storage', ['$event'])
  onSelectedCharacterChange(event: StorageEvent){
    if(event.key === 'game-data')
      this._setupGameData();
  }
  @HostListener('window:beforeunload', ['$event']) 
  onBeforeCloseTab(event:any){
    this._clearGameData();
  }
  
  @HostListener('window:unload', ['$event']) 
  onCloseTab(event:any){
    this._clearGameData();
  }

  ngOnInit(): void {
    this._setupGameData();
  }

  ngOnDestroy(): void {   
    this._clearGameData();
  }

  public onSubmit(){
    if(this.btnTxt === 'PLAY AGAIN'){
      this._setForNewGame();
      return;
    }
    if(this.currentBlock !== null && this.currentBlock.options.length === 0){
      this._switchMenu("Story");
      this.isLoading = true;
      //something went wrong after the scene text stream. Generate options and preserve the scene text
      if(this.currentQuest.blocks.length === 0){
        this._completeInitialization$(this._getInitRequest())
        .pipe(
          finalize(() => this.isLoading = false),
          takeUntilDestroyed(this._destroyRef)
        ).subscribe({
          error: error => {
            this._notificationsService.openSnack(ESnackAlertType.ERROR, error.message, true, 5000)
            this.gameData.gameStatus = 'READY';
            this.btnTxt = 'BEGIN';
          }
        })
      }
      else{
        
        this._generateBlock$()
          .pipe(
            finalize(() => this.isLoading = false),
            takeUntilDestroyed(this._destroyRef)
          ).subscribe({
            error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, error.message, true, 3000)
          });
      }
    }
    if(this.didGameInit && this.hasGameOngoing && this.currentBlock){
      if(!this.selectedChoice || this.selectedChoice === '' ){
        this._snackBar.open("You must pick a choice from the available to continue", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
        return;
      }
      // if the selectedChoice is the BAD_CHOICE, recover the original tagged option to be parsed in the backend
      let taggedOption = this.currentBlock.options.find(x => x.includes(this.selectedChoice ?? ''));
      if(taggedOption)
        this.selectedChoice = taggedOption;
      // if the current block already exists (game recovery), update it
      if(this.currentQuest.blocks.filter(x => x.id === this.currentBlock?.id).length > 0){
        let block = this.currentQuest.blocks.find(x => x.id === this.currentBlock?.id);
        if(block)
          block.choice = this.selectedChoice;
      }
      else { //otherwise add it
        this.currentBlock.choice=this.selectedChoice;
        this.currentQuest.blocks.push(this.currentBlock);
      }
      this._handleQuest();
      
    }
    else this._initializeQuest();
  }

  public onOpenBtnClick(btn:string){
    if(btn === 'left')
      this.panelStateL = (this.panelStateL === 'visible') ? 'hidden' : 'visible';
    
    else this.panelStateR = (this.panelStateR === 'visible') ? 'hidden' : 'visible';
  }

  public onMenuSelect(event:TreeMenuItem){
    this._switchMenu(event.name);
  }

  private _initializeQuest(){
    if(this.currentQuest){
      let req:InitQuestRequest = this._getInitRequest();
      this.sceneText = "";
      this.isLoading = true;
      this.gameData.gameStatus = 'INITIALIZING';
      this._service.initQuestStream(req)
        .pipe(
          tap(ev => this._updateStreamText(ev)),
          filter(ev => ev.type === HttpEventType.Response),
          tap(() => this._onStreamEnd()),
          switchMap(res => this._completeInitialization$(req)),
          finalize(() => this.isLoading = false),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
          error: error => {
            this._notificationsService.openSnack(ESnackAlertType.ERROR, error.message, true, 5000)
            this.gameData.gameStatus = 'READY';
            this.btnTxt = 'BEGIN';
          }
        })
    } 
  }

  private _getInitRequest() : InitQuestRequest{
    return {
      questId: this.currentQuest.id,
      username:this.gameData.username,
      charCollectionAddress:this.currentQuest.charCollectionAddress,
      charTokenId:`${this.currentQuest.charTokenId}`
    }
  }
  private _handleQuest(){ 
    const blockBackup = this.currentBlock;
    this.currentBlock = null;
    this.isLoading = true;
    this._switchMenu("Story");
    this._service.handleQuestStream(this.currentQuest.id, this.currentQuest.blocks.slice(-1)[0], this._isGameRecovery && this.currentQuest.blocks.length > 1)
    .pipe(
      tap(ev => this._updateStreamText(ev)),
      filter(ev => ev.type === HttpEventType.Response),
      tap(res => this._onStreamEnd()),
      switchMap(res =>
        this.currentQuest.blocks.length < this.currentQuest.maxBlocks -1 ? 
        this._generateBlock$() :
        this._handleQuestEnd$()),
      finalize(() => this.isLoading = false),
      takeUntilDestroyed(this._destroyRef)
    )
    .subscribe({
      next: res => {
        if(this.hasFinishedQuest){
          this.btnTxt = 'PLAY AGAIN';
        }
      },
      error: error => { 
        this.currentBlock = blockBackup;
        this._notificationsService.openSnack(ESnackAlertType.ERROR, error.message, true, 3000);
      }
    })
  }

  private _completeInitialization$(req:InitQuestRequest) : Observable<RandomQuestDto>{
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
    let filter: SortedFilter = {
      conditions:conditions,
      page:0,
      page_size:1,
      sort_var:'creationDate',
      is_descending:true
    }
    return this._service.sortedQuery(filter) 
      .pipe(
        catchError(error => throwError(() => new Error(`An error has occured while retrieving the new Quest >> ${error.message}`))),
        tap(res =>{
          if(res.data.length == 0)
            throw new Error('No current quest found');  
          this.currentQuest = res.data[0];
          this.gameData.gameSessionId = this.currentQuest.id;
          localStorage.setItem('game-data', JSON.stringify(this.gameData));
        }),
        switchMap(() => this._generateSceneOptions$()), 
        switchMap(() => this._updateQuestData$(this.gameData.gameSessionId, 'ONGOING', true))
      )
  }

  private _generateBlock$() : Observable<RandomQuestDto>{
    const observable = this.currentQuest.blocks.length < this.currentQuest.maxBlocks -2 ?
      this._generateSceneOptions$() : this._generateFinalSceneOptions$()
      return observable.pipe(
        switchMap(res => this._patchQuestBlocks$())
      )
  }

  private _generateSceneOptions$() : Observable<QuestBlockDto>{
    return this._service.generateSceneOptions({id:this.gameData.gameSessionId, scene:this.sceneText})
      .pipe(
        filter(() => !!this.currentBlock),
        map(res => this._onBlockOptionsGenerated(res))
      )
  }
  
  private _generateFinalSceneOptions$() : Observable<QuestBlockDto>{
    return this._service.generateFinalOptions({id:this.gameData.gameSessionId, scene:this.sceneText})
      .pipe(
        filter(() => !!this.currentBlock),
        map(res => this._onFinalOptionsGenerated(res)) 
      )
  }

  private _handleQuestEnd$() : Observable<RandomQuestDto>{
    if(!this.currentBlock)
      throw new Error(`An error has occured while ending the quest. No current block found`); 
    this._handleEndgameDisplay(this.currentQuest.blocks.slice(-1)[0].choice); 
    this.currentQuest.blocks.push(this.currentBlock);
    this.currentChoices = [];
    this.currentBlock = null;
    return defer(() => this._web3Service.getPlayerSession(this.currentQuest.charCollectionAddress, parseInt(this.currentQuest.charTokenId)))
      .pipe(
        catchError(error => throwError(() => `An error has occured while retrieving the game session data >> ${error.message}`)),
        switchMap(session => this._endGame$(session))
      )
  }

  private _endGame$(session: PlayerGameSession) : Observable<RandomQuestDto>{
    let endGameReq: EndGameRequest = {
      contract: session.contract,
      wallet: session.player,
      collection: this.currentQuest.charCollectionAddress,
      tokenId: parseInt(this.currentQuest.charTokenId),
      chainId: session.chainId,
      epoch: session.epoch,
      outcome: this._gameStatusToOutcome(this.gameData.gameStatus),
      finalBlock: this.currentQuest.blocks.slice(-1)[0]
    }
    return this._service.endQuest(this.currentQuest.id, this.gameData.gameStatus, endGameReq) 
      .pipe(
        catchError(error => throwError(() => new Error(`An error has occured while ending the quest >> ${error.message}`))), 
        tap(res => { 
          if(!res.signature || res.signature === '')
            throw new Error(`An error has occured while settling the current game. Invalid signature`);
          this.currentQuest = res;
        }),
        switchMap(res => this._settleGame$(res, endGameReq.outcome, res.signature ?? '')), 
        switchMap(res => this._tryWithraw$(res, endGameReq.outcome)) 
      );
  }

  private _settleGame$(quest: RandomQuestDto, outcome: number, signature: string) : Observable<RandomQuestDto>{
      return defer(() => this._web3Service.settleGame(this.currentQuest.charCollectionAddress, parseInt(quest.charTokenId), outcome, signature)) 
        .pipe(
          map(res => { 
            if(!res)
              throw Error('An error has occured while settling the current game');
            this._snackBar.open("Current QUEST finished! ", undefined, { duration: 3000,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
            this._readCurrentQuestSummary();
            return quest;
          })
        )
  }

  private _tryWithraw$(currentQuest: RandomQuestDto, outcome: number) : Observable<RandomQuestDto>{
    // skip attempt if there is no reward to withdraw or the quest status is no valid
    return outcome !== GameOutcome.WIN? 
      of(currentQuest) : this.hasFinishedQuest ?
      defer(() => this._web3Service.tryQuestRewardWithdraw())
        .pipe(
          catchError(error => throwError(() => new Error(`An error has occured while trying to withdraw the game reward >> ${error.error}`))), 
          map(receipt => currentQuest) 
        ) : of(currentQuest)
  }

  private _setOngoingSession(){
    this.isLoading = true;
    this._service.getById(this.gameData.gameSessionId)
    .pipe(
      tap(res => this.currentQuest = res),
      switchMap(res => {
        if(this.currentQuest.blocks.length > 0){
          this.currentBlock = this.currentQuest.blocks.slice(-1)[0];
          this.sceneText = this.currentBlock.scene;
          this.currentChoices = this._shuffledFinalOptions([...this._getSanitizedOptions(this.currentBlock.options)]);
          this.gameData.currentBlock = this.currentQuest.blocks.length;
          this.currentQuest.blocks.forEach(x => {
            this._addSceneMenuOption(x.id);
            this.storyText += `${x.summary}\n\n`
          });
          this.currentQuest.blocks = this.currentQuest.blocks.filter(b => b.id !== this.currentBlock?.id);
          return of(res);
        }
        else {
          this._switchMenu("Intro");
          return this.currentQuest.status === 'INITIALIZING' ? 
            this._updateQuestData$(this.currentQuest.id, 'REINITIALIZING', false)
              .pipe(
                catchError(error => throwError(() => `An error has occured while recovering an UNINITIALIZED quest >> ${error.message}`))
              ) : of(res);
          }
      }),
      finalize(() => this.isLoading = false),
      takeUntilDestroyed(this._destroyRef)
    )
    .subscribe({ 
      next: res => {
        this.currentQuest = res;
        this.gameData.gameStatus = this.currentQuest.status;
        this._isGameRecovery = true;
        if(this.hasFinishedQuest)
          this.btnTxt = "PLAY AGAIN";
      },
      error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, error)
    })
  }

  private _updateStreamText(res: any){
    this.streamedText = res["partialText"];
    if(this.streamedText)
        this.sceneText = this.streamedText; 
  }
  private _onStreamEnd(){
    this.gameData.currentBlock++;
    this.currentBlock = {
      id: this.gameData.currentBlock,
      scene:this.sceneText,
      options: [],
      choice:"",
      summary:""
    }
    localStorage.setItem('game-data', JSON.stringify(this.gameData));
    this._addSceneMenuOption(this.currentBlock.id);
  }

  private _onBlockOptionsGenerated(response: SceneOptionsResponse) : QuestBlockDto{
    if(!this.currentBlock)
      throw Error('An error has occured while processing the generated scene options >> no current block found');
    this.currentBlock.options = [...response.options];
    this.currentChoices = [...this.currentBlock.options];
    this.currentBlock.options.push(`${response.bad_choice} <<BAD_CHOICE>>`);
    this.currentChoices.push(response.bad_choice);
    this.currentChoices = this._shuffledFinalOptions([...this.currentChoices]);
    this._snackBar.open("Select your choice!", undefined, { duration: 2500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
    return this.currentBlock;
  }

  private _onFinalOptionsGenerated(response: FinalOptionsResponse) : QuestBlockDto{
    if(!this.currentBlock)
      throw Error('An error has occured while processing the generated scene options >> no current block found');
   
    let finalOptions: string[] = this._shuffledFinalOptions([
      response.happy_end_choice,
      response.uncertain_end_choice,
      response.game_over_choice
    ])
    this.currentChoices = finalOptions;
    this.currentBlock.options = [
      `${response.happy_end_choice} <<HAPPY>>`,
      `${response.uncertain_end_choice} <<UNCERTAIN>>`,
      `${response.game_over_choice} <<GAME_OVER>>`
    ];
    return this.currentBlock;
  }
  //Sets the quest status and updates the block options in the backend. Init & End only
  private _updateQuestData$(sessionId: string, status: string, updateBlocks: boolean) : Observable<RandomQuestDto>{
    return this._service.setQuestStatus(sessionId, status)
      .pipe(
        catchError(error => throwError(() => error)),
        tap(res => {
          this.currentQuest = res;
          this.gameData.gameStatus = this.currentQuest.status;
          localStorage.setItem('game-data', JSON.stringify(this.gameData));
        }),
        switchMap(res => updateBlocks ? this._patchQuestBlocks$() : of(res))
      )
  }

  private _patchQuestBlocks$() : Observable<RandomQuestDto>{
    return this._service.getById(this.currentQuest.id)
      .pipe(
        filter(() => !!this.currentBlock),
        catchError(error => throwError(() => new Error(`An error has occured while retrieving the current quest >> ${error.message}`))),
        switchMap(res => {
          const questUpdate = { ...res, blocks: [...res.blocks] };
          if(this.currentBlock)
            questUpdate.blocks.push(this.currentBlock);
          return this._service.patchQuestBlocks(questUpdate);
        }),
        tap(res => this.currentQuest = res)
      )
  }

  private _getGameData():GameData | null{
    if(!isPlatformBrowser(this.platformId)) return null;
    let gameDataCache = localStorage.getItem('game-data')
    return gameDataCache ? JSON.parse(gameDataCache) : null;
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
          .subscribe({
            next: res => this.currentQuest = res,
            error: error => this._notificationsService.openSnack(ESnackAlertType.WARN, error.message, true, 3000)            
          });
      }
    }
  }

  private _shuffledFinalOptions(options: string[], selected: string[] = []) : string[]{
    if(options.length == 0) return selected;
    
    let option:string = options[this._getRandomInt(options.length)];
    if(option)
    {
      selected.push(option);
      options = options.filter(x => x !== option);
    }
    return this._shuffledFinalOptions(options, selected);
  }

    private _isValidGameData(data: GameData){
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
          let block = this.currentQuest.blocks.filter(x => x.id === parseInt(split[1].trim()))[0];
          if(block){
            this.sceneText = `> SCENE: ${block.scene}\n\n> CHOICE: ${this._getSanitizedOption(block.choice ?? '')}`;
            this.currentChoices = this._getSanitizedOptions(block.options);
            this.selectedChoice = block.choice;
          }
        }
      break;
    }
  }

  private _getSanitizedOptions(options:string[]){
    return options.map(option => this._getSanitizedOption(option));
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

  private _readCurrentQuestSummary(){
    this._service.getById(this.currentQuest.id)
    .pipe(
      takeUntilDestroyed(this._destroyRef)
    )
    .subscribe({
      next: res => {
        this.currentQuest = res;
        if(this.currentQuest.blocks.length > 0){
          this.storyText = "";
          this.currentQuest.blocks.forEach(block => {
            this.storyText += `${block.summary}\n\n`
          });
          this.storyText += `QUEST ${this.currentQuest.status}`
        }
      },
      error: error => this._notificationsService.openSnack(ESnackAlertType.WARN, error.message, true, 3000)
    })
  }
  //max is exclusive
  private _getRandomInt(max:number, min: number = 0) : number{
    min = Math.floor(min)
    max = Math.floor(max)
    return Math.round(Math.random() * (max - min + 1) + min);
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
      this.btnTxt = 'PLAY AGAIN';
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

  private _gameStatusToOutcome(status:string){
    switch(status){
      case('COMPLETED'):
        return GameOutcome.WIN;
      case('UNCERTAIN'):
        return GameOutcome.DRAW;
      case('FAILED'):
        return GameOutcome.LOSS;
      default:
        return GameOutcome.NONE
    }
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
}
