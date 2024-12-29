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

@Component({
  selector: 'app-world-generator',
  templateUrl: './world-generator.component.html',
  styleUrl: './world-generator.component.scss'
})
export class WorldGeneratorComponent implements OnInit{
  public gameType!: string | null;
  public charName!: string | null;
  public nftAmbiences:string[] = ['Fantasy', 'Medieval'] //post-apocalyptic, cyber-punk, sci-fi, 
  public availableGenres:string[]= ['Thriller', 'Survival', 'Suspense', 'Comedy', 'Mystery', 'Romance', 'Historical Fiction', 'Dystopia', 'Supernatural']
  public selectedAmbiences: string[] = []
  public selectedGenres: string[]=[]
  public form!: FormGroup;  
  private _fb:FormBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  separatorKeysCodes: number[] = [ENTER, COMMA];
  // filteredAmbiences: Observable<string[]>;
  // filteredGenres: Observable<string[]>;
  filteredAmbiences: string[] = [];
  filteredGenres: string[] = [];

  @ViewChild('ambienceInput') ambienceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('genreInput') genreInput!: ElementRef<HTMLInputElement>;

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

    this.form = this._fb.group({
      ambience: new FormControl('', [Validators.required]),
      genre: new FormControl(''),
      plot: new FormControl(undefined, [Validators.maxLength(200)])
    })

    // this.form.controls['ambience'].valueChanges.subscribe((ambience: string | null) =>{ 
    //   console.log('-- on ambience change --', ambience)
    //   this.filteredAmbiences = (ambience ? this._filterAmbience(ambience) : this.nftAmbiences.slice())
    // });
    // this.form.controls['genre'].valueChanges.subscribe((genre: string | null) =>{ 
    //   console.log('-- on genre change -- ', genre)
    //   this.filteredGenres = (genre ? this._filterGenre(genre) : this.availableGenres.slice())
    // });
  }
  addAmbience(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) 
      this.selectedAmbiences.push(value);
    // Clear the input value
    event.chipInput!.clear();
    this.form.controls['ambience'].setValue(null);
  }

  removeAmbience(ambience: string): void {
    const index = this.selectedAmbiences.indexOf(ambience);
    if (index >= 0) {
      this.selectedAmbiences.splice(index, 1);
      this.announcer.announce(`Removed ${ambience}`);
    }
  }

  ambienceSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedAmbiences.push(event.option.viewValue);
    this.ambienceInput.nativeElement.value = '';
    this.form.controls['ambience'].setValue(null);
  }

  private _filterAmbience(value: string): string[] {
    return this.nftAmbiences.filter(ambience => ambience.toLowerCase().includes(value.toLowerCase()));
  }
  
  addGenre(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) 
      this.selectedGenres.push(value);
    // Clear the input value
    event.chipInput!.clear();
    this.form.controls['genre'].setValue(null);
  }

  removeGenre(genre: string): void {
    const index = this.selectedGenres.indexOf(genre);
    if (index >= 0) {
      this.selectedGenres.splice(index, 1);
      this.announcer.announce(`Removed ${genre}`);
    }
  }

  genreSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedGenres.push(event.option.viewValue);
    this.genreInput.nativeElement.value = '';
    this.form.controls['genre'].setValue(null);
  }

  private _filterGenre(value: string): string[] {
    return this.availableGenres.filter(genre => genre.toLowerCase().includes(value.toLowerCase()));
  }
  private _getGameData():GameData | null{
      let gameDataCache = localStorage.getItem('game-data')
      return gameDataCache ? JSON.parse(gameDataCache) : null;
  }
  public onGenerateClick(){
    console.log('-- onGenerate --')
    let gameData = this._getGameData();
    if(!gameData){
      this._router.navigateByUrl('randomworlds/game/quest')
      return;
    }
    //TODO: chipsDataSource = gameData.userPrefs (nft data) -> filter -> update from chips
    // gameData.userPreferences = {
    //   "ambiences":[],
    //   "genres":[""],
    //   "moods":[],
    //   "suggestion":"",
    //   "constraints":[""]
    // }
    //TODO: generat Lore w/AssTeam. Add to gameData | userPrefs
    localStorage.setItem('game-data', JSON.stringify(gameData))
    this._router.navigateByUrl('randomworlds/game/quest')
  }
}
