import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CharactersService } from '../../../../services/characters.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CharacterProfileDto } from '../../../../../shared/models/mgmt-interfaces';
import { SearchInputConfig } from '../../../../../shared/components/search-input/search-input-config';

@Component({
  selector: 'app-load-profile-dialog',
  templateUrl: './load-profile-dialog.component.html',
  styleUrl: './load-profile-dialog.component.scss'
})
export class LoadProfileDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  searchConfig = new SearchInputConfig('characters/containing-tag', 'GET', 'char_name', 'Profile Name')
  @ViewChild('descriptionbox') descriptionbox!: ElementRef;
  profile!: CharacterProfileDto
  constructor(private service: CharactersService){}

  onProfileSelected(profile:CharacterProfileDto){
    this.profile = profile
    this.descriptionbox.nativeElement.value = this.profile.description
  }
  getSelectedProfile(){
    return this.profile
    }
}

