import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { questViewSidebarConfig } from 'src/app/core/constants/configs/side-navbar';
import { TreeMenuItem } from 'src/app/modules/shared/components/tree-menu/tree-menu-item.model';
import { GameData } from 'src/app/modules/shared/models/common-interfaces';
import { Router } from '@angular/router'
import { QuestsService } from '../../services/quests.service';
import { QuestBlockDto, QuestInitRequest } from 'src/app/core/interfaces/business/prompting.interface';
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
  isStreamingOn:boolean = false;
  hasStreamedScene:boolean = false;
  actionsBarConfig:Array<TreeMenuItem> = questViewSidebarConfig;
  panelStateR = 'hidden';
  panelStateL = 'hidden';
  hasGameOngoing:boolean = false;
  gameData!:GameData;
  currentBlock!:QuestBlockDto; 
  choicesMock = [
    "In Quest Mode you can play an adventure in a random world with your selected character. The genre of the story and the generated lore depends on your selected character and your the settings you choose at the beginning of the adventure",
    "In this mode all the adventures begin in a tavern of the generated world, where you will be able to start different quests with the guidance of the AI Game Master",
    "The game follows a 'Choose your own adventure' style in which the Game Master will present you an scenario with up to four possible actions to choose from, and progress in your story in order to complete your Quest and save your progression or die trying!",
    "And this is a shorter option to see how does it fit"
  ]
  selectedChoice!:string | null;
  private _snackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _service: QuestsService = inject(QuestsService);
  @ViewChild('scenebox') scenebox!:ElementRef;
  ngOnInit(): void {
    let gameData = this._getGameData();
    if(gameData){
      if(gameData.gameType !== 'quest'){
        this._router.navigateByUrl('randomworlds/home');
        return;
      }
      this.hasGameOngoing = gameData.gameSessionId !== "";
      this.gameData = gameData;
    }  
    this.btnTxt = this.hasGameOngoing ? "SUBMIT" : "BEGIN"
  }

  public onSubmit(){
    console.log('-- on submit --')
    if(this.hasGameOngoing){
      if(!this.selectedChoice || this.selectedChoice === '' ){
        this._snackBar.open("You must pick a choice from the available to continue", undefined, { duration: 2500,panelClass: ['snack-warning'], verticalPosition: 'bottom'});
        return;
      }
    }else{
      let req:QuestInitRequest = {
        username:this.gameData.username,
        charname:this.gameData.charname,
        charCollectionAddress:this.gameData.charCollectionAddress,
        charTokenId:this.gameData.charTokenId,
        charInfo:this.gameData.charInfo,
        ambiences:this.gameData.userPreferences["ambiences"],
        genres:this.gameData.userPreferences["genres"],
        moods:this.gameData.userPreferences["moods"],
        suggestion:this.gameData.userPreferences["suggestion"],
        constraints:this.gameData.userPreferences["constraints"],
        maxBlocks:10
      }
      console.log('-- init req -- ', req);
      this.hasStreamedScene = false;
      this.sceneText = "";
      this.isStreamingOn = true;
      this._service.initQuest(req).subscribe(res => {
        console.log(res)
        if(this._handleResponseStream(res)){
          this._snackBar.open("Select your choice!", undefined, { duration: 2500,panelClass: ['snack-success-login'], verticalPosition: 'bottom'});
          this.gameData.currentBlock++;
          this.currentBlock.id = this.gameData.currentBlock;
          console.log('-- new block parsed --', this.currentBlock);
        }
      })
    }
  }
  private _validateCurrentBlock() : boolean{
    if(this.sceneText && this.sceneText !== ""){
      if(this.choicesText && this.choicesText !== ""){
        this.currentBlock = {
          id:0,
          scene:this.sceneText,
          options: [],
          choice:""
        }
        this.choicesText = this.choicesText.replace("<<OPTIONS>>", "");
        this.choicesText.trim();
        console.log('-- trimed choices text --', this.choicesText);
        let options = this.choicesText.split('OPTION:');
        console.log('-- options split --', options);
        options.forEach(option => {
          let value = option.trim();
          if(value && value !== "")
            this.currentBlock.options.push(value);
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
      this.isStreamingOn=false;   
      return this._validateCurrentBlock();
    }
    this.streamedText = res["partialText"];
    if(this.streamedText){
      if(!this.hasStreamedScene){
        if(this.streamedText.includes("<<")){
          this.hasStreamedScene = true;
          this.streamedText = this.streamedText.replace("<<", "")
        }
        this.sceneText = this.streamedText;
      }
      else this.choicesText = this.streamedText.replace(this.sceneText, ""); 
    } 
    return false;
  }

  private _getGameData():GameData | null{
      let gameDataCache = localStorage.getItem('game-data')
      return gameDataCache ? JSON.parse(gameDataCache) : null;
  }
}
