import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { SummaryDto } from '../../../../../shared/models/mgmt-interfaces';
import { SummariesMgmtService } from '../../../../services/summaries-mgmt.service';

@Component({
  selector: 'app-save-summary',
  templateUrl: './save-summary.component.html',
  styleUrl: './save-summary.component.scss',
})
export class SaveSummaryComponent {
 
  data:SummaryDto = inject(MAT_DIALOG_DATA);
  public comments:string[] = []
  public  displayedColumns: string[] = ['observations', 'actions'];
  private _service = inject(SummariesMgmtService)
  private _dialog:MatDialogRef<SaveSummaryComponent> = inject(MatDialogRef<SaveSummaryComponent>)
  @ViewChild('commentInput') commentInput!: ElementRef

  onAdd(){
    console.log('-- on add --',this.commentInput.nativeElement.value)
    let observation = this.commentInput.nativeElement.value;
    if(observation !== ''){
      this.comments.push(observation)
      this.comments = [...this.comments]
    }
    this.commentInput.nativeElement.value = ''
  }
  onDelete(event: any){
    console.log('-- on delete --', event)
    this.comments = [...this.comments.filter(x => x !== event)]
  }
  onSave(){
    console.log('-- on save click --');
    this.data.observations = this.comments;
    this._service.saveSummary(this.data).subscribe(res => {
      console.log(' -- on save response --', res)
      this._dialog.close({"success": true})
    })
  }
}
