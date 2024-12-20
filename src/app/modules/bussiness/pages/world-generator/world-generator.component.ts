import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'

@Component({
  selector: 'app-world-generator',
  templateUrl: './world-generator.component.html',
  styleUrl: './world-generator.component.scss'
})
export class WorldGeneratorComponent implements OnInit{
  public gameType!: string | null;
  public charName!: string | null;
  public nftAmbiences:string[] = ['Fantasy', 'Medieval']
  public selectedAmbiences: string[] = []
  public form!: FormGroup;  
  private _fb:FormBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.gameType = localStorage.getItem('game-type');
    this.charName = localStorage.getItem('selected-char');

    if(!this.gameType || !this.charName){
      this._snackBar.open("An error has occured while trying to begin the game. Game type or Character bad configured", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      this._router.navigateByUrl('randomworlds/home')
    }

    this.form = this._fb.group({
      ambience: new FormControl([]),
      genres: new FormControl('Thriller, Survival, Suspense'),
      plot: new FormControl(undefined, [Validators.maxLength(200)])
    })
  }
  public onGenerateClick(){
    console.log('-- onGenerate --')
    this._router.navigateByUrl('randomworlds/game/quest')
  }

  public removeAmbience(ambience:string){
    this.selectedAmbiences = this.selectedAmbiences.filter(x => x !== ambience);
  }
}
