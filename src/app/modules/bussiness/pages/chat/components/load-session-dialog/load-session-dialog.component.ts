import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { SearchInputConfig } from '../../../../../shared/components/search-input/search-input-config';
import { SessionDto } from '../../../../../shared/models/mgmt-interfaces';
@Component({
  selector: 'app-load-session-dialog',
  templateUrl: './load-session-dialog.component.html',
  styleUrl: './load-session-dialog.component.scss'
})
export class LoadSessionDialogComponent {
  searchConfig = new SearchInputConfig('session/containing-tag', 'GET', 'tag', 'Tag')
  @ViewChild('summarybox') summarybox!: ElementRef;
  session!: SessionDto
  
  onSessionSelected(session:SessionDto){
    console.log(session)
    this.session = session
    this.summarybox.nativeElement.value = this.session.summary
  }

  getSelectedSession(){
    return this.session
  }
}
