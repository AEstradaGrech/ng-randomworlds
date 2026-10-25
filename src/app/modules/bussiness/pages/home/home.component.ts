import { Component, Inject, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { DOCUMENT } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  imageSource:any;
  sanitizer = inject(DomSanitizer);
  imagesService = inject(ImagesService);
  router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _authService = inject(AuthService);

  ngOnInit(): void {
    let data = localStorage.getItem('game-data');
    if(!data)
      this._setGameData('quest');
    
  }
  async onBeginClick(gameMode:string){
    if(!this._authService.userLogin()){
        this.router.navigateByUrl('/auth/login');
        return;
    }
    let data = localStorage.getItem('game-data');
    let gameData: GameData | null = data ? JSON.parse(data) : null;
    
    switch(gameMode){
      case('quest'):
        if(gameData && gameData.selectedCharacter){
          if(gameData.character)
            this.router.navigateByUrl('randomworlds/game/quest');
          else this.router.navigateByUrl('randomworlds/world/generator');
        } 
        else{
          this._setGameData('quest');
          this.router.navigateByUrl('randomworlds/character/select');
        }
        break;
      case('adventure'):
        localStorage.setItem('game-type', 'adventure');
        this.router.navigateByUrl('randomworlds/character/select');
        break;
      default: 
        this._snackBar.open("An error has occured while trying to begin the game", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      break;
    }
  }

  private async _setGameData(gameType:string){
    let login = localStorage.getItem('user-login');
    if(!login){
      this.router.navigateByUrl('auth/login');
      return;
    }
    let creds = JSON.parse(login)
    let data: GameData ={
      username: creds.username,
      gameType:gameType,
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
}
