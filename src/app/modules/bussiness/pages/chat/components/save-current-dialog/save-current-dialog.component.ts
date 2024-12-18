import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CharactersService } from '../../../../services/characters.service';
import { CharacterProfileDto } from '../../../../../shared/models/mgmt-interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-save-current-dialog',
  templateUrl: './save-current-dialog.component.html',
  styleUrl: './save-current-dialog.component.scss'
})
export class SaveCurrentDialogComponent {
  private _snackBar = inject(MatSnackBar);
  data = inject(MAT_DIALOG_DATA);
  constructor(private service: CharactersService,public dialogRef: MatDialogRef<SaveCurrentDialogComponent>){}
  profileName:string = ''
  onClose(){
    let req: CharacterProfileDto = {
      char_name: this.profileName,
      description: this.data.systemMessage
    }
    try{
      this.service.addProfile(req).subscribe(res => {
        console.log(res)
        let isSuccessful: boolean = false;
        
          isSuccessful = true;
        this.dialogRef.close({
          "isSuccessful": true,
          "profileName": this.profileName 
        })
      })  
    }catch(error){
      this._snackBar.open("An error has occured while saving the profile", undefined, { duration: 1000, panelClass: 'snack-warning'})
    }
  }
}
