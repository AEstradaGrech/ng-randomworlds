import { Component, inject, OnInit,  ElementRef, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatIconModule} from '@angular/material/icon';
import {AsyncPipe} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { QuestsService } from '../../services/quests.service';
import { QuestIntroRequest } from 'src/app/core/interfaces/business/prompting.interface';

@Component({
  selector: 'app-world-generator',
  templateUrl: './world-generator.component.html',
  styleUrl: './world-generator.component.scss'
})
export class WorldGeneratorComponent implements OnInit{
  public gameType!: string | null;
  public charName!: string | null;
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
  public form!: FormGroup;  
  public quests:any[] = []
  private _fb:FormBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _service = inject(QuestsService);
  private _gameData!:GameData;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  // filteredAmbiences: Observable<string[]>;
  // filteredGenres: Observable<string[]>;
  filteredAmbiences: string[] = [];
  filteredMoods: string[]=[]
  filteredGenres: string[]= ['Action', 'Drama','Thriller', 'Horror', 'Comedy', 'Mystery', 'Romance', 'Fantasy'];

  @ViewChild('ambienceInput') ambienceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('moodsInput') moodsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('genresInput') genreInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);

  constructor() {
    // this.filteredAmbiences = new Observable<string[]>()
    // this.filteredGenres = new Observable<string[]>()
  }

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
    if(this._gameData.characterMeta){
      this.selectedAmbiences = this._gameData.characterMeta.ambiences;
      this.selectedMoods = this._gameData.characterMeta.moods;
      this.form = this._fb.group({
        ambiences: new FormControl(this.selectedAmbiences),
        moods: new FormControl(this.selectedMoods),
        genres: new FormControl(''),
        plot: new FormControl(undefined, [Validators.maxLength(200)])
      })
    }
    // this.quests.push({id: this.quests.length +1})
    // this.quests.push({id: this.quests.length +1})
    // this.form.controls['ambience'].valueChanges.subscribe((ambience: string | null) =>{ 
    //   console.log('-- on ambience change --', ambience)
    //   this.filteredAmbiences = (ambience ? this._filterAmbience(ambience) : this._gameData.characterMeta?.ambiences.slice() ?? [])
    // });
    // this.form.controls['genre'].valueChanges.subscribe((genre: string | null) =>{ 
    //   console.log('-- on genre change -- ', genre)
    //   this.filteredGenres = (genre ? this._filterGenre(genre) : this.availableGenres.slice())
    // });
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

  private _getGameData():GameData | null{
      let gameDataCache = localStorage.getItem('game-data')
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
    if(this._gameData.userPreferences){
      let introReq: QuestIntroRequest = {
        character:null,
        useRandomCharacter:true, //formControl
        desiredName:"", //formControl
        preferences:this._gameData.userPreferences
      }
      this._service.generateIntro(introReq).subscribe(res => {
        console.log('-- on intro response --')
        //add to array
        if(this.quests.length == 2){
          this.quests = this.quests.slice(-1)
          this.quests[0].id = 1
        }
        this.quests.push({id: this.quests.length + 1, data: res, preferences: introReq.preferences})
        //
      })
      //TODO: generat Lore w/AssTeam. Add to gameData | userPrefs
    }
    
  }
  public onPlayQuestClick(quest: any){
    // this._gameData.intro = intro
    //localStorage.setItem('game-data', JSON.stringify(gameData))
    this._router.navigateByUrl('randomworlds/game/quest')
  }
  public onReviewQuestClick(quest:any){
    console.log(quest)
  }
}
