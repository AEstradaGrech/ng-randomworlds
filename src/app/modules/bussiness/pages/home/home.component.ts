import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  imageSource:any
  sanitizer = inject(DomSanitizer)
  imagesService = inject(ImagesService)
  router = inject(Router)
  private _snackBar = inject(MatSnackBar)
  ngOnInit(): void {
    // this.imagesService.getLastWithName("DarkTemplar").subscribe(res => {
    //   this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res.base64}`);
    // })
    
  }

  onBeginClick(gameType:string){
    switch(gameType){
      case('quest'):
        localStorage.setItem('game-type', 'quest')
        console.log('-- stored game --', localStorage.getItem('game-type'))
        this.router.navigateByUrl('randomworlds/character/select');
        break;
      case('adventure'):
        localStorage.setItem('game-type', 'adventure')
        this.router.navigateByUrl('randomworlds/character/select');
        break;
      default: 
        this._snackBar.open("An error has occured while trying to begin the game", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'})
      break;
    }
  }
}
