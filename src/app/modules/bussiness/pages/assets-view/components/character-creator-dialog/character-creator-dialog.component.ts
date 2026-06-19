import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { map } from 'rxjs/operators';
import { CreateCharacterRequest, QuestCharacter } from 'src/app/core/interfaces/business/prompting.interface';
import { ImagesService } from 'src/app/modules/bussiness/services/images.service';
import { QuestsService } from 'src/app/modules/bussiness/services/quests.service';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { SystemMessageDto } from 'src/app/modules/shared/models/mgmt-interfaces';

@Component({
  selector: 'app-character-creator-dialog',
  templateUrl: './character-creator-dialog.component.html',
  styleUrl: './character-creator-dialog.component.scss'
})
export class CharacterCreatorDialogComponent extends BaseComponent implements OnInit {

  data = inject(MAT_DIALOG_DATA);
  
  @ViewChild('ambienceInput') ambienceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('moodInput') moodInput!: ElementRef<HTMLInputElement>;
  @ViewChild('suggestbox') suggestbox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('constraintsbox') constraintsbox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('displaybox') displaybox!: ElementRef<HTMLTextAreaElement>;
  
  separatorKeysCodes: number[] = [ENTER, COMMA];
  availableAmbiences:string[] = [];
  selectedAmbiences:string[] = [];
  availableMoods:string[] = [];
  selectedMoods:string[] = [];
  isFemaleChar: boolean = false;
  isRandomGenre: boolean = false;
  showSettings: boolean = true;
  form!: FormGroup;
  currentProfile!: any;
  readonly UNKNOWN_CHAR_IMG: string = 'assets/images/UnknownChar.png';
  readonly MALE_CHAR_IMG: string = 'assets/images/MaleChar.png';
  readonly FEMALE_CHAR_IMG: string = 'assets/images/FemaleChar.png';

  private _connectedWallet!: string;
  private _imagesService: ImagesService = inject(ImagesService);
  private _charactersService: QuestsService = inject(QuestsService); // TODO: CharactersService
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _currentImageUrl:string = '';
  private _generatedProfiles: QuestCharacter[] = [];
  public get charImageUrl(): string{
    return this._currentImageUrl;
  }

  ngOnInit(): void {
    this._currentImageUrl = this.isFemaleChar ? this.FEMALE_CHAR_IMG : this.MALE_CHAR_IMG;
    this._connectedWallet = this.data.connectedWallet;
    if(!this._connectedWallet){
      this._notificationsService.openSnack(ESnackAlertType.WARN, "No connected wallet found, mint service unavailable");
    }
    this._imagesService.getAmbiences().subscribe(res => {
      console.log('-- on ambiences response --', res);
      this.availableAmbiences = res.data.map((item:SystemMessageDto) => item.description);
      console.log('-- mapped ambiences --', this.availableAmbiences);
    });
    this._imagesService.getMoods().subscribe(res => {
      console.log('-- on moods response --', res);
      this.availableMoods = res.data.map((item:SystemMessageDto) => item.description);
      console.log('-- mapped moods --', this.availableMoods);
    });
    this.form = this._formBuilder.group({
      name: new FormControl(''),
      age: new FormControl(''),
      isFemaleChar: new FormControl(this.isFemaleChar)
    })
    this._displayTabChangeAlerts("Ambiences");
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  onShowSettings(){
    this.showSettings = true;
  }
  onHideSettings(){
    this.showSettings = false;
  }
  onTabChange(event: MatTabChangeEvent){
    console.log('-- on tab change --', event.tab.textLabel);
    this._displayTabChangeAlerts(event.tab.textLabel);
  }
  onGenerateProfileClick(){
    console.log('-- on generate character profile --');
    if(this.selectedAmbiences.length === 0 && this.selectedMoods.length === 0){
      this._notificationsService.openSnack(ESnackAlertType.ERROR, "Cannot create a character profile without at least one selected AMBIENCE and/or MOOD");
      return;
    }
    let req: CreateCharacterRequest = {
      name: this.form.get('name')?.value,
      age: this.form.get('age')?.value,
      ambiences: this.selectedAmbiences,
      moods: this.selectedMoods,
      suggestions: this.suggestbox.nativeElement.value.trim(),
      constraints: this.constraintsbox.nativeElement.value.trim().length > 0 ? [this.constraintsbox.nativeElement.value] : []
    }
    console.log('on generate profile click', req);
    this._charactersService.generateCharacterProfile(req).subscribe(res => {
      console.log('-- on char profile response --', res);
      this._generatedProfiles.push(res);
      this.showSettings = false;
      this.displaybox.nativeElement.value = this._renderCharacterProfile(res);
    });
  }
  onCharacterGenreToggle(event: MatSlideToggleChange){
    console.log('-- on toggle change --');
    this.isFemaleChar = event.checked;
    this.form.get('isFemaleChar')?.setValue(this.isFemaleChar);
    this._updateImageUrl(this.form.get('isFemaleChar')?.value);
  }
  onRandomGenreCharacter(event: MouseEvent){
    console.log('-- on random btn --', event);
    this.isRandomGenre = !this.isRandomGenre;
    this.form.get('isFemaleChar')?.setValue(this.isRandomGenre ? undefined : this.isFemaleChar);
    this._updateImageUrl(this.form.get('isFemaleChar')?.value);
  }
  removeAmbience(item:string){
    if(this.selectedAmbiences.includes(item))
      this.selectedAmbiences = this.selectedAmbiences.filter(x => x !== item);
    if(!this.availableAmbiences.includes(item))
      this.availableAmbiences.push(item);
  }
  removeMood(item: string){
    if(this.selectedMoods.includes(item))
      this.selectedMoods = this.selectedMoods.filter(x => x !== item);
    if(!this.availableMoods.includes(item))
      this.availableMoods.push(item);
  }

  private _updateImageUrl(isFemaleChar: boolean | undefined){
    if(isFemaleChar === undefined){
      this._currentImageUrl = this.UNKNOWN_CHAR_IMG;
    }
    else{
      this._currentImageUrl = isFemaleChar ? this.FEMALE_CHAR_IMG : this.MALE_CHAR_IMG;
    }
  }

  private _displayTabChangeAlerts(tabLabel: string){
    switch(tabLabel){
      case("Ambiences"):
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Select at least one AMBIENCE style and up to five (counting up the MOODS too)');  
      break;
      case("Moods"):
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Select at least one MOOD style and up to five (counting up the AMBIENCES too)');
        break;
      case("Character"):
        if(this.selectedAmbiences.length == 0 && this.selectedMoods.length == 0){
          this._notificationsService.openSnack(ESnackAlertType.WARN, 'No character styles selected. Select at least one AMBIENCE and one MOOD');
        }
        break;
      default: break;
    }
  }

  private _renderCharacterProfile(profile: QuestCharacter){
    let text = ''
    Object.keys(profile).forEach((k:any) => {
      text += `\n${k}: ${Object(profile)[k]}`;
    })
    return text.trim()
  }
}
