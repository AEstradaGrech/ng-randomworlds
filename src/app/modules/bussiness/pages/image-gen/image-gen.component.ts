import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';
import { ApiSettingsService } from '../../services/api-settings.service';
import { SearchInputConfig } from '../../../shared/components/search-input/search-input-config';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenerateImageRequest } from '../../../shared/models/images.interfaces';

@Component({
  selector: 'app-image-gen',
  templateUrl: './image-gen.component.html',
  styleUrl: './image-gen.component.scss'
})
export class ImageGenComponent implements OnInit {
  imageSource:any
  isUsingInferenceAPI:boolean = true
  currentModel:string = 'Select a diffuser model...'
  showSettings: boolean = false
  currentPromptMsg = ''
  withFileSave:boolean = true
  withDbSave:boolean = true
  isGenerating:boolean = false
  localDiffusers: string[] = []
  apiDiffusers: string[] = []
  
  form!: FormGroup
  sanitizer = inject(DomSanitizer)
  imagesService = inject(ImagesService)
  apiSettingsService = inject(ApiSettingsService)

  private _snackBar = inject(MatSnackBar);

  @ViewChild('promptbox') promptbox!: ElementRef;
  
  constructor(private fb: FormBuilder){}
  ngOnInit(): void {
    this.imagesService.getLastWithName("Walpurgister").subscribe(res => {
      this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res.base64}`);
    })
    this.apiSettingsService.getAvailableDiffusers().subscribe(res => {
      console.log(res)
      this.localDiffusers = res.local
      this.apiDiffusers = res.api
    })
    this.form =this.fb.group({
      diffuser: new FormControl('', [Validators.required]),
      fileName: new FormControl(''),
      tag: new FormControl(''),
      height: new FormControl(512), 
      width: new FormControl(800), 
      guidance: new FormControl(7.5),
      seed: new FormControl(null), 
      steps: new FormControl(50),
      generatedItems: new FormControl(1),  
    })
  }

  onExpanded(){
    this.showSettings = true;
  }
  onCollapsed(){
   this.showSettings = false; 
  }
  onUseApiToggle(event:any){
    this.isUsingInferenceAPI = event.checked
  }

  onFileSaveChange(event:any){
    this.withFileSave = event.checked
  }

  onDbSaveChange(event:any){
    this.withDbSave = event.checked
  }

  onDiffuserSelected(event:any){
    console.log('-- on diffuser selected --',event)
    this.currentModel = event.value
  }

  onPrompt(){
    this.showSettings = false
    this.currentPromptMsg = this.promptbox.nativeElement.value;
    if(this._isValidateRequest()){
      let req = this._getRequestModel()
      console.log(req)
      this.isGenerating = true;
      if(this.isUsingInferenceAPI){
        this.imagesService.apiInference(req).subscribe(res => {
          console.log(res)
          this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res.base64}`);
          this.isGenerating = false;
          this.showSettings = false
        })
      }else{
        this.imagesService.generate(req).subscribe(res => {
          console.log(res)
          this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res[0].base64}`);
          this.isGenerating = false;
          this.showSettings = false
        })
      }
    }
  }

  private _isValidateRequest(): boolean{
    if(this.currentPromptMsg === ''){
      this._snackBar.open("Type something to generate the image!", undefined, { duration: 3000, panelClass: 'snack-warning', verticalPosition:'top'})
      return false
    }
    if(this.form.get('diffuser')?.value === ''){
      this._snackBar.open("Select a diffuser to generate the image!", undefined, { duration: 3000, panelClass: 'snack-warning', verticalPosition:'top'})
      return false
    }
    return true
  }
  private _getRequestModel(): GenerateImageRequest{
    let req: GenerateImageRequest = {
      prompt: this.currentPromptMsg,
      diffuser_name:this.form.get('diffuser')?.value,
      name: this.form.get('fileName')?.value,
      tag: this.form.get('tag')?.value,
      height: this.form.get('height')?.value,
      width: this.form.get('width')?.value,
      guidance:this.form.get('guidance')?.value,
      inference_steps: this.form.get('steps')?.value,
      seed:this.form.get('seed')?.value,
      num_gen: this.form.get('generatedItems')?.value,
      file_save: this.withFileSave,
      db_save: this.withDbSave
    }
    return req
  }
}
