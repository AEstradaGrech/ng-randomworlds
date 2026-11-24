import { Component, inject, OnInit,  ElementRef, ViewChild, HostListener, signal, computed, effect, EffectRef, DestroyRef, OnChanges, SimpleChanges, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { QuestsService } from '../../services/quests.service';
import { GeneratedQuest, GeneratedQuestData, NewQuestRequest, QuestCharacter, QuestIntroRequest, QuestPreferences } from 'src/app/core/interfaces/business/prompting.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AssetModel, CharacterMetadata } from 'src/app/core/interfaces/business/smart-contract.interface';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { SmartContractsService } from '../../services/smart-contracts.service';
import { replaceEndpoint } from 'src/app/core/constants/configs/nft-card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, Subject } from 'rxjs';
import { SquaredButtonConfig } from 'src/app/modules/shared/components/squared-button/squared-button.model';
import { appSquaredButton } from 'src/app/core/constants/configs/squared-button';
import { checkAddresses } from 'src/app/core/utilities/addressComparator';

@Component({
  selector: 'app-world-generator',
  templateUrl: './world-generator.component.html',
  styleUrl: './world-generator.component.scss',
  animations:[
    trigger('settingsState', [
          state('visible', style({ height: '0vh' })),
          state('hidden', style({ height:'45vh', overflow: 'hidden' })),
          transition('* => visible', animate('150ms ease-in')),
          transition('* => hidden', animate('150ms ease-out'))
        ])
  ]
})
export class WorldGeneratorComponent extends BaseComponent implements OnInit{
  public squaredButtonConfig: SquaredButtonConfig = appSquaredButton;

  public selectedAmbiences: string[] = []
  public selectedMoods: string[]=[]
  public selectedGenres: string[]=[]
  public selectedConstraints: string[]=[]
  public form!: FormGroup;
  public selectedQuest = signal<any | null>(null);

  public quests:GeneratedQuest[] = []
  public showSettings:string = 'visible';
  public isRandomCharacter:boolean = false;
  public isLoading = signal<boolean>(false);
  public isStartingGame = signal<boolean>(false);
  public actionLoading = computed(() => { return this.isLoading() || this.isStartingGame() });
  public currentIntro:string = ''
  private _fb:FormBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _service = inject(QuestsService);
  private _web3Service = inject(SmartContractsService);
  private _destroyRef = inject(DestroyRef);
  private _disableControlEffect?: EffectRef = effect(() => {
    if (!this.form) return;
    const quest = this.selectedQuest();
    // Decide whether controls should be disabled: when a quest exists and its status is not NOT_STARTED
    const shouldDisable = !!quest ? quest.status !== 'NOT_STARTED' : false;
    // Iterate all controls in the FormGroup and enable/disable as needed
    Object.values(this.form.controls).forEach(ctrl => {
      if (shouldDisable) {
        if (!ctrl.disabled) ctrl.disable({ emitEvent: false });
      } else {
        if (ctrl.disabled) ctrl.enable({ emitEvent: false });
      }
    });
  });

  private _gameData!:GameData;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredAmbiences: string[] = [];
  filteredMoods: string[]=[]
  filteredGenres: string[]= ['Action', 'Drama','Thriller', 'Horror', 'Comedy', 'Mystery', 'Romance', 'Fantasy'];


  public formControlDisabled = computed(() => {
    let currentQuest = this.selectedQuest();
    if(currentQuest)
      return currentQuest.status !== 'NOT_STARTED';
    else return false;
  });

  @ViewChild('ambienceInput') ambienceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('moodsInput') moodsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('genresInput') genreInput!: ElementRef<HTMLInputElement>;
  @ViewChild('constraintsInput') constraintsInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);

  public selectedCharacter = signal<AssetModel | null>(null);
  public metadata!: CharacterMetadata;
  public image = computed(() => {
    let selectedChar: AssetModel | null = this.selectedCharacter();
    return selectedChar ? `url(${replaceEndpoint(selectedChar.image, 'IPFS', 'ALCHEMY')})` : '';
  });
  public isCharLocked = computed(() => {
    let selectedChar: AssetModel | null = this.selectedCharacter();
    return selectedChar && selectedChar.isLocked !== undefined ? selectedChar.isLocked : false;
  });

  ngOnInit(): void {
    
    this._setupGameData();
  }

  @HostListener('window:storage', ['$event'])
  onSelectedCharacterChange(event: StorageEvent){
    console.log('-- WORLD GENERATOR >> ON CHARACTER CHANGE >> STORAGE EVENT', event);
    if(event.key === 'game-data'){
      let gameData = this._getGameData();
      if(!gameData || !gameData.selectedCharacter){
        this._router.navigateByUrl('randomworlds/home');
      }
      else {
        if(this.selectedQuest())
          this.selectedQuest().set(null);
        this._setupGameData();
      }
    }
  }

  private _setupGameData(){
    let gameData = this._getGameData();
    if(!gameData){
      this._router.navigateByUrl('randomworlds/home');
      return;
    }
    this._gameData = gameData;
    if(this._gameData.selectedCharacter){
      this.selectedCharacter.set(this._gameData.selectedCharacter);
      if(this._gameData.selectedCharacter.metadata){
        this.metadata = this._gameData.selectedCharacter.metadata;
        this._gameData.charname = this._gameData.selectedCharacter?.metadata.name ?? '';
        if(this._gameData.selectedCharacter.isInGame){
          this._service.getCurrentQuestFor(
            this._gameData.selectedCharacter.tokenId, 
            this._gameData.selectedCharacter.contractAddress, 
            this._gameData.selectedCharacter.ownerAddress)
            .pipe(
              takeUntilDestroyed(this._destroyRef)
            )
            .subscribe({
              next: res => {
                if(res){
                  this._notificationsService.openSnack(ESnackAlertType.WARN, 'Recovering Game for selected character', true, 3000);
                  this._gameData.gameSessionId = res.id;
                  this._gameData.gameStatus = res.status;
                  this._gameData.intro = res.intro ?? '';
                  this._gameData.character = this._gameData.selectedCharacter?.metadata.profile as QuestCharacter;
                  this._gameData.userPreferences = res.preferences;
                  localStorage.setItem('game-data', JSON.stringify(this._gameData));
                  let data: GeneratedQuestData = { intro: res.intro ?? '', character: res.character };
                  this.quests.push({id: this.quests.length + 1, data: data, preferences: res.preferences, asset: this.selectedCharacter(), status: res.status})
                  this.currentIntro = `CHARACTER:\n${res.character}\nINTRO SCENE:\n\n${res.intro}`;
                  this.selectedQuest.set(this.quests.slice(-1));
                  // keep 'plot' control in sync with disabled state when recovering an ongoing quest
                  if (this.form) {
                    if (this.formControlDisabled()) {
                      this.form.controls['plot'].disable();
                    } else {
                      this.form.controls['plot'].enable();
                    }
                  }
                  this.onShowSettings(false);
                }
              },
              error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while recovering the current game session: ${error.message}`)
            });
          //try get current session for character 
          // _setOngoingOption()
          //  gameData.sessionId = res.id
          //  pintar opcion con 'CONTINUE'
        }
      }
      else {
        this._notificationsService.openSnack(ESnackAlertType.ERROR, 'No character metadata present in the game data', true, 3000);
        setTimeout(() => { this._router.navigateByUrl('randomworlds/home');}, 3000);
        return;
      }
      this.selectedAmbiences = this.metadata.profile.ambiences;
      this.selectedMoods = this.metadata.profile.moods;
      this.selectedGenres = [];
      this.onShowSettings(true);
      this.currentIntro = this.quests.length > 0 && this.currentIntro ? this.currentIntro :  '';
      this.form = this._fb.group({
        ambiences: new FormControl(this.selectedAmbiences),
        moods: new FormControl(this.selectedMoods),
        genres: new FormControl(''),
        constraints: new FormControl(this.selectedConstraints),
        plot: new FormControl('', [Validators.maxLength(200)])
      });

      // Keep the 'plot' control disabled/enabled in sync with the computed signal used by other inputs.
      if (this.formControlDisabled()) {
        this.form.controls['plot'].disable();
      } else {
        this.form.controls['plot'].enable();
      }
    }
    else {
      this._notificationsService.openSnack(ESnackAlertType.ERROR, 'No character selected', true, 2500);
      setTimeout(() => {this._router.navigateByUrl('randomworlds/home');}, 3000);
      return;
    }
  }
  addAmbience(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value && this.filteredAmbiences.includes(value)){ 
      this.selectedAmbiences.push(value);
      this.filteredAmbiences = this.filteredAmbiences.filter(x => x !== value)
    }
    // Clear the input value
    event.chipInput!.clear();
    this.form.controls['ambience'].setValue(null);
  }

  removeAmbience(ambience: string): void {
    const index = this.selectedAmbiences.indexOf(ambience);
    if (index >= 0) {
      let removed = this.selectedAmbiences.splice(index, 1);
      this.filteredAmbiences.push(removed[0])
      this.announcer.announce(`Removed ${ambience}`);
    }
  }

  ambienceSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedAmbiences.push(event.option.viewValue);
    this.filteredAmbiences = this.filteredAmbiences.filter(x => x !== event.option.viewValue)
    this.ambienceInput.nativeElement.value = '';
    this.form.controls['ambience'].setValue(null);
  }
  
  addMood(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value && this.filteredMoods.includes(value)){ 
      this.selectedMoods.push(value);
      this.filteredMoods = this.filteredMoods.filter(x => x !== value)
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  removeMood(mood: string): void {
    const index = this.selectedMoods.indexOf(mood);
    if (index >= 0) {
      let removed = this.selectedMoods.splice(index, 1);
      this.filteredMoods.push(removed[0])
      this.announcer.announce(`Removed ${mood}`);
    }
  }

  moodSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedMoods.push(event.option.viewValue);
    this.filteredMoods = this.filteredMoods.filter(x => x !== event.option.viewValue)
    this.moodsInput.nativeElement.value = '';
  }
  addGenre(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value && this.filteredGenres.includes(value)){ 
      this.selectedGenres.push(value);
      this.filteredGenres = this.filteredGenres.filter(x => x !== value)
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  removeGenre(genre: string): void {
    const index = this.selectedGenres.indexOf(genre);
    if (index >= 0) {
      this.filteredGenres.push(this.selectedGenres.splice(index, 1)[0]);
      this.announcer.announce(`Removed ${genre}`);
    }
  }

  genreSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedGenres.push(event.option.viewValue);
    this.filteredGenres = this.filteredGenres.filter(x => x !== event.option.viewValue)
    this.genreInput.nativeElement.value = '';
  }

  addConstraint(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) 
      this.selectedConstraints.push(value);
    // Clear the input value
    event.chipInput!.clear();
  }

  removeConstraint(constraint: string): void {
    const index = this.selectedConstraints.indexOf(constraint);
    if (index >= 0) {
      this.selectedConstraints = this.selectedConstraints.filter(x => x !== constraint)
      this.announcer.announce(`Removed ${constraint}`);
    }
  }
  public onUseRandomCharToggle(event:any){
    this.isRandomCharacter = event.checked;
  }
  private _getGameData():GameData | null{
      let gameDataCache = localStorage.getItem('game-data');
      return gameDataCache ? JSON.parse(gameDataCache) : null;
  }
  public onGenerateClick(){
    let character = this.selectedCharacter();
    if(!character) return;
    let formValues = this.form.getRawValue();
    let preferences:QuestPreferences = {
      ambiences: formValues.ambiences,
      moods: formValues.moods,
      genres: formValues.genres,
      constraints: formValues.constraints,
      suggestion: formValues.plot
    }
    console.log('-- intro req prefs --', preferences)
    if(this._hasValidPreferences(preferences)){
      let introReq: QuestIntroRequest = {
        character:this.isRandomCharacter ? null : character.metadata.profile as QuestCharacter ?? null,
        preferences:preferences
      }
      console.log('-- intro req --', introReq);
      this.filteredGenres = [...this.filteredGenres, ...this.selectedGenres];
      this.isLoading.set(true);
      this._service.generateIntro(introReq)
        .pipe(
          finalize(() => this.isLoading.set(false)),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
          next:res => {
            this.showSettings = 'hidden';
            if(this.quests.length == 2){
              this.quests = this.quests.slice(-1)
              this.quests[0].id = 1
            }
            let data: GeneratedQuestData = { intro: res.intro, character: res.character };
            this.quests.push({id: this.quests.length + 1, data: data, preferences: introReq.preferences, asset: this.selectedCharacter(), status: 'NOT_STARTED'})
            this.currentIntro = `CHARACTER:\n${this._formatCharacterData(res.character)}\nINTRO SCENE:\n\n${res.intro}`;
            this.selectedQuest.set(this.quests.slice(-1)[0]);

        },
        error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while generating the quest preferences: ${error.message}`)
      })
    }
    
  }
  public onPlayQuestClick(quest: any){
    if(quest.status === 'NOT_STARTED'){
      const address = this._gameData.selectedCharacter?.contractAddress;
      const tokenId = this._gameData.selectedCharacter?.tokenId;
      if(address && tokenId){
        this.isStartingGame.set(true);
        this._gameData.character = quest.data.character;
        this._gameData.intro = quest.data.intro;
        this._gameData.userPreferences = quest.preferences;
        localStorage.setItem('game-data', JSON.stringify(this._gameData));
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Starting game');
        defer(() => this._web3Service.startGame(address, tokenId))
          .pipe(
            finalize(() => this.isStartingGame.set(false)),
            takeUntilDestroyed(this._destroyRef)
          )
          .subscribe({
            next:res => {
              if(!res) {
                this._notificationsService.openSnack(ESnackAlertType.WARN, 'An error has occured while starting the game: attempting retry');
                this._retrySession(address, tokenId, 3);
              }
              else this._router.navigateByUrl('randomworlds/game/quest'); 
            },
            error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while starting the game: ${error.message}`)
          }); 
      }
      else this._notificationsService.openSnack(ESnackAlertType.WARN, 'Invalid contract address and / or char token ID'); 
    }
    else this._router.navigateByUrl('randomworlds/game/quest');
  }

  private _retrySession(address:string, tokenId:number, retries: number = 1){
    setTimeout(() => {
      defer(() => this._web3Service.getPlayerSession(address, tokenId))
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: session => {
          if(checkAddresses(session.player, this._web3Service.connectedWallet ?? ''))
            this._router.navigateByUrl('randomworlds/game/quest'); 
          else{
            let message = 'An error has occured while retrying the game start: Invalid Session Player & Contract.';
            if(retries > 0){
              this._retrySession(address, tokenId, --retries);
              this._notificationsService.push(`${message} Retrying again`, 6000, 'bottom');
            }
            else {
              this._notificationsService.openSnack(ESnackAlertType.ERROR, `${message} Try again later`);
              this._saveFailedGame(address, tokenId);
            };
          }
        },
        error: error => {
          if(retries > 0){
            this._retrySession(address, tokenId, --retries);
            this._notificationsService.openSnack(ESnackAlertType.WARN, `An error has occured while retrying the game start: ${error.message}. Retrying again`);
          }
          else this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while retrying the game start: ${error.message}. Cannot start the game`);
        }
      })
    }, 3000);
  }

  private _saveFailedGame(address:string, tokenId:number){
    if(this._gameData.character){
      let req:NewQuestRequest = {
      username:this._gameData.username,
      charCollectionAddress:address,
      charTokenId:`${tokenId}`,
      character:this._gameData.character,
      preferences:this._gameData.userPreferences as QuestPreferences,
      intro:this._gameData.intro,
      isRandomCharacter:this._gameData.isRandomCharacter,
      maxBlocks:5
    }
    this._service.saveNewQuest(req)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: res => {
          this._gameData.gameSessionId = res.id;
          localStorage.setItem('game-data', JSON.stringify(this._gameData));
        },
        error: error => this._notificationsService.openSnack(ESnackAlertType.WARN, error.message, true, 3000),
        complete: () => this._router.navigateByUrl('randomworlds/home')            
      });
    }
    else {
      this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while saving the failed game: no QuestCharacter found in GameData. Abandon the game to restart`);
      this._router.navigateByUrl('randomworlds/home'); 
    }
  }
  public onReviewQuestClick(quest:any){
    console.log(quest);
    this.selectedQuest.set(quest);

    if(quest.status === 'NOT_STARTED'){
      this.currentIntro = `CHARACTER:\n${this._formatCharacterData(quest.data.character)}\nINTRO SCENE:\n\n${quest.data.intro}`;
      this.selectedCharacter.set(quest.asset);
      this.selectedAmbiences = [...quest.preferences.ambiences];
      this.selectedMoods = [...quest.preferences.moods];
      this.selectedGenres = [...quest.preferences.genres];
      this.selectedConstraints = [...quest.preferences.constraints];
      this.form = this._fb.group({
        ambiences: new FormControl(this.selectedAmbiences),
        moods: new FormControl(this.selectedMoods),
        genres: new FormControl(this.selectedGenres),
        constraints: new FormControl(this.selectedConstraints),
        plot: new FormControl(quest.preferences.suggestion, [Validators.maxLength(200)])
      })
    }
    else{
      this.currentIntro = `CHARACTER:\n${quest.data.character}\nINTRO SCENE:\n\n${quest.data.intro}`;
      this.onShowSettings(false);
    }
  }
  public onShowSettings(value:boolean){
    this.showSettings = value ? 'visible' : 'hidden';
  }
  private _hasValidPreferences(preferences:QuestPreferences) : boolean{
    if(preferences.ambiences.length <= 0){
      this._snackBar.open("You have to select at least one 'Quest Ambience'", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      return false;
    }
    if(preferences.genres.length <= 0){
      this._snackBar.open("You have to select at least one 'Story Genre'", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      return false;
    }
    return true
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
REMARKABLE COMMENT: ${data.comment}
    `
  }
}
