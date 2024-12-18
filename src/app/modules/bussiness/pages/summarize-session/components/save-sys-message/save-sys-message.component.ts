import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CharactersService } from '../../../../services/characters.service';
import { CharacterProfileDto, SysMessageTypeDto, SystemMessageDto } from '../../../../../shared/models/mgmt-interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SysMsgMgmtService } from '../../../../services/sysmsgs-mgmt.service';

@Component({
  selector: 'app-save-sys-message',
  templateUrl: './save-sys-message.component.html',
  styleUrl: './save-sys-message.component.scss'
})
export class SaveSysMessageComponent implements OnInit {  
  constructor(private service: SysMsgMgmtService,public dialogRef: MatDialogRef<SaveSysMessageComponent>){}
  
  data = inject(MAT_DIALOG_DATA);
  templateName:string = ''

  private _type!:SysMessageTypeDto;

  ngOnInit(): void {
    this.service.getMessageTypes().subscribe(res => {
      let type = res.filter(x => x.description === 'Summarization')
      if(type.length <= 0) this.dialogRef.close({"success": false});
      this._type = type[0];
    })
  }

  onClose(){
    let req: SystemMessageDto = {
      id: '',
      type: this._type.type, 
      description: this._type.description, 
      tag: this.templateName,
      message: this.data.systemMessage
    }
    this.service.add(req).subscribe(res => {
      console.log(res)
      this.dialogRef.close({
        "isSuccessful": true,
        "data": res 
      })
    })  
  }
}
