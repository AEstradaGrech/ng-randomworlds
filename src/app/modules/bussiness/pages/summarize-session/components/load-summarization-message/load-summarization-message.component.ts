import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CharactersService } from '../../../../services/characters.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CharacterProfileDto, SystemMessageDto } from '../../../../../shared/models/mgmt-interfaces';
import { SearchInputConfig } from '../../../../../shared/components/search-input/search-input-config';

@Component({
  selector: 'app-load-summarization-message',
  templateUrl: './load-summarization-message.component.html',
  styleUrl: './load-summarization-message.component.scss'
})
export class LoadSummarizationMessageComponent {
  data = inject(MAT_DIALOG_DATA);
  searchConfig = new SearchInputConfig('mgmt/summaries/summarization-messages/containing-tag', 'GET', 'tag', 'Tag')
  @ViewChild('descriptionbox') descriptionbox!: ElementRef;
  profile!: SystemMessageDto
  constructor(){}

  onProfileSelected(profile:SystemMessageDto){
    console.log('-- on profile selected --', profile)
    this.profile = profile;
    this.descriptionbox.nativeElement.value = this.profile.message;
  }
  getSelectedProfile(){
    return this.profile
  }
  
}
