import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SysMessageTypeDto, SystemMessageDto } from '../../../../../shared/models/mgmt-interfaces';
import { SearchInputConfig } from '../../../../../shared/components/search-input/search-input-config';
import { SysMsgMgmtService } from '../../../../services/sysmsgs-mgmt.service';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sys-msg-detail',
  templateUrl: './sys-msg-detail.component.html',
  styleUrl: './sys-msg-detail.component.scss'
})
export class SysMsgDetailComponent implements OnInit {
  selectedType!:number;
  messageTag!:string;
  currentMsg!:string;
  msgTypes:SysMessageTypeDto[] = [];
  data:any = inject(MAT_DIALOG_DATA);
  isEditing:boolean = false;
  btnText!:string;

  private _service: SysMsgMgmtService = inject(SysMsgMgmtService);
  private _dialogRef: MatDialogRef<SysMsgDetailComponent> = inject(MatDialogRef<SysMsgDetailComponent>);
  private _snackBar = inject(MatSnackBar);

  @ViewChild('descriptionbox') descriptionbox!: ElementRef;
  @ViewChild('tagInput') tagInput!: MatInput;
  ngOnInit(): void {
    this.currentMsg = this.data.isEdit ? this.data.msg.message : '';
    this.btnText = this.data.isEdit ? 'Update' : 'Create';
    this.selectedType = this.data.isEdit ? this.data.msg.type : null;
    this.messageTag = this.data.isEdit ? this.data.msg.tag : null;
    this._service.getMessageTypes().subscribe(res => {
      this.msgTypes = res
    })
  }

  submit(){
    if(!this.data.isEdit){
      let msg:SystemMessageDto = {
        id:'',
        type: this.selectedType,
        description:'',
        tag:this.messageTag,
        message: this.descriptionbox.nativeElement.value
      }

      if(!this._validateRequest(msg)) return;

      this._service.add(msg).subscribe(res => {
        this._snackBar.open("New System Message created!", undefined, { duration: 2500, panelClass: 'snack-success-uncen'})
        this._dialogRef.close(res)
      })
    }
    else {
      this.data.msg.message = this.descriptionbox.nativeElement.value
      this.data.msg.type = this.selectedType;
      this.data.msg.tag = this.messageTag
      if(!this._validateRequest(this.data.msg)) return;
      this._service.update(this.data.msg).subscribe(res => {
        this._snackBar.open("System Message updated!", undefined, { duration: 2500, panelClass: 'snack-success-uncen'})
        this._dialogRef.close(this.data);
      })
    } 
  }

  onEditMessageToggle(event:any){
    this.isEditing = event.checked;
  }

  onTypeSelected(event:SysMessageTypeDto){
    console.log('-- on type selected -- ', event)
  }

  private _validateRequest(msg: SystemMessageDto): boolean{
    if(!msg.type){
      this._snackBar.open("Invalid model. No message type has been selected", undefined, { duration: 2500, panelClass: 'snack-warning-uncen'})
      return false;
    }
    if(!msg.message){
      this._snackBar.open("Invalid model. No system message has been set", undefined, { duration: 2500, panelClass: 'snack-warning-uncen'})
      return false;
    }  
    return true;
  }
}
