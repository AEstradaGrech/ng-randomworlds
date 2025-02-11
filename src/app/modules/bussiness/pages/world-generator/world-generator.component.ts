import { Component, inject, OnInit,  ElementRef, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { QuestsService } from '../../services/quests.service';
import { QuestCharacter, QuestIntroRequest, QuestPreferences } from 'src/app/core/interfaces/business/prompting.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AssetModel, CharacterMetadata } from 'src/app/core/interfaces/business/smart-contract.interface';

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
export class WorldGeneratorComponent implements OnInit{
  /* (https://www.premiumbeat.com/blog/guide-to-basic-film-genres/#the-basic-film-genres)
  Action
  Comedy
  Drama
  Fantasy
  Horror
  Mystery = Thirller = Suspense (si se quiere https://diymfa.com/reading/mystery-thriller-suspense-label-matter/)
  Romance
  Thriller
  */
  public selectedAmbiences: string[] = []
  public selectedMoods: string[]=[]
  public selectedGenres: string[]=[]
  public selectedConstraints: string[]=[]
  public form!: FormGroup;  
  public quests:any[] = []
  public showSettings:string = 'visible';
  public isRandomCharacter:boolean = false;
  public isLoading:boolean = false;
  public currentIntro:string = ''
  private _fb:FormBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _service = inject(QuestsService);
  private _gameData!:GameData;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredAmbiences: string[] = [];
  filteredMoods: string[]=[]
  filteredGenres: string[]= ['Action', 'Drama','Thriller', 'Horror', 'Comedy', 'Mystery', 'Romance', 'Fantasy'];

  @ViewChild('ambienceInput') ambienceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('moodsInput') moodsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('genresInput') genreInput!: ElementRef<HTMLInputElement>;
  @ViewChild('genresInput') constraintsInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);

  public selectedCharacter!: AssetModel;
  public metadata!: CharacterMetadata;
  public imageUrl: string = '';
  constructor() {}

  ngOnInit(): void {
    // this.gameType = localStorage.getItem('game-type');
    // this.charName = localStorage.getItem('selected-char');

    // if(!this.gameType || !this.charName){
    //   this._snackBar.open("An error has occured while trying to begin the game. Game type or Character bad configured", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
    //   this._router.navigateByUrl('randomworlds/home')
    // }
    let gameData = this._getGameData();
    if(!gameData){
      this._router.navigateByUrl('randomworlds/game/quest')
      return;
    }
    this._gameData = gameData;
    if(this._gameData.selectedCharacter){
      this.selectedCharacter = this._gameData.selectedCharacter;
      this.imageUrl = `url(${this.selectedCharacter.imageUrl})`
      if(this.selectedCharacter.metadata){
        this.metadata = this.selectedCharacter.metadata;
      }
      else {
        // snakAlert
        console.log('-- no char metadata found --');
        return;
      }
      this.selectedAmbiences = this.metadata.profile.ambiences;
      this.selectedMoods = this.metadata.profile.moods;
      this.form = this._fb.group({
        ambiences: new FormControl(this.selectedAmbiences),
        moods: new FormControl(this.selectedMoods),
        genres: new FormControl(''),
        constraints: new FormControl(this.selectedConstraints),
        plot: new FormControl('', [Validators.maxLength(200)]),
        desiredName: new FormControl(undefined, [Validators.maxLength(30)])
      })
    }
    // this.quests.push({id: this.quests.length +1})
    // this.quests.push({id: this.quests.length +1})
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
    //this.form.controls['ambiences'].setValue(null); ?? Pa ke?
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
    //this.form.controls['ambience'].setValue(null);
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
    //this.form.controls['genre'].setValue(null);
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
    //this.form.controls['genre'].setValue(null);
  }

  addConstraint(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) 
      this.selectedConstraints.push(value);
    // Clear the input value
    event.chipInput!.clear();
    //this.form.controls['genre'].setValue(null);
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
    console.log('-- onGenerate --')
    
    //TODO: chipsDataSource = gameData.userPrefs (nft data) -> filter -> update from chips
      // gameData.userPreferences = {
      //   "ambiences":[],
      //   "genres":[""],
      //   "moods":[],
      //   "suggestion":"",
      //   "constraints":[""]
      // }
    console.log('-- form val --',this.form.getRawValue())
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
        character:this.isRandomCharacter ? null : this._gameData.character ?? null,
        useRandomCharacter:this.isRandomCharacter, //formControl
        desiredName:this.isRandomCharacter ? formValues.desiredName : "", //formControl
        preferences:preferences
      }
      console.log('-- intro req --', introReq);
      this.isLoading = true;
      this._service.generateIntro(introReq).subscribe(res => {
        console.log('-- on intro response --', res)
        //add to array
        this.isLoading = false;
        this.showSettings = 'hidden';
        if(this.quests.length == 2){
          this.quests = this.quests.slice(-1)
          this.quests[0].id = 1
        }
        this.quests.push({id: this.quests.length + 1, data: res, preferences: introReq.preferences, character: res.character})
        this.currentIntro = `CHARACTER:\n${this._formatCharacterData(res.character)}\nINTRO SCENE:\n\n${res.intro}`;
        //
      })
      //TODO: generat Lore w/AssTeam. Add to gameData | userPrefs
    }
    
  }
  public onPlayQuestClick(quest: any){
    // this._gameData.intro = intro
    //localStorage.setItem('game-data', JSON.stringify(gameData))
    this._gameData.character = quest.data.character;
    this._gameData.intro = quest.data.intro;
    this._gameData.userPreferences = quest.preferences;
    localStorage.setItem('game-data', JSON.stringify(this._gameData));
    this._router.navigateByUrl('randomworlds/game/quest')
  }
  public onReviewQuestClick(quest:any){
    console.log(quest)
    this.currentIntro = `CHARACTER:\n${this._formatCharacterData(quest.data.character)}\nINTRO SCENE:\n\n${quest.data.intro}`;
    this.selectedAmbiences = [...quest.preferences.ambiences];
    this.selectedMoods = [...quest.preferences.moods];
    this.selectedGenres = [...quest.preferences.genres];
    this.selectedConstraints = [...quest.preferences.constraints];
    // para cada array --> handle filtered... (comparar con gameData.character (source of truth)) #TODO 
    this.isRandomCharacter = quest.data.isRandomCharacter;
    if(this.isRandomCharacter)
      this.form.controls["desiredName"].setValue(quest.character.name);
    this.form = this._fb.group({
      ambiences: new FormControl(this.selectedAmbiences),
      moods: new FormControl(this.selectedMoods),
      genres: new FormControl(this.selectedGenres),
      constraints: new FormControl(this.selectedConstraints),
      plot: new FormControl(quest.preferences.suggestion, [Validators.maxLength(200)]),
      desiredName: new FormControl(quest.character.name, [Validators.maxLength(30)])
    })
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
