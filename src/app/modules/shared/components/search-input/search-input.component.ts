import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SessionsMgmtService } from '../../../bussiness/services/sessions-mgmt.service';
import { SearchInputConfig } from './search-input-config';



@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  constructor(private http: HttpClient, sessionsMgmtService:SessionsMgmtService){
    
  }

  private _baseUrl:string = 'http://localhost:8000'
  currentValue:string = ""
  selected:any = ""
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @Input() config!:SearchInputConfig;
  @Input() disabled: boolean = false;
  @Output() onValueSelected: EventEmitter<any> = new EventEmitter<any>();
  options: any[] = [];
  filteredOptions: any[] = [];

  filter(): void {
    this.currentValue = this.input.nativeElement.value
    if(this.config){
      switch(this.config.method){
        case 'GET':
          
          this.http.get<any>(`${this._baseUrl}/${this.config.url}/${this.currentValue}`)
            .subscribe(res=> {
              this._onSearchResponse(res)
          })  
          break;
        case 'POST':
          this.http.post<any>(`${this.config.url}`, this.config.params)
            .subscribe(res=> {
              this._onSearchResponse(res);
          })
          break;
        default:
          break;
      }
    }
  }

  onSelected(event:any){
    console.log(event)
    let item = this.options.filter(x => x.id === event.option.id)[0]
    this.onValueSelected.emit(item)
  }

  private _onSearchResponse(items:any){
    this.options = items;
    this.filteredOptions = this.options.filter(o => o[this.config.key].includes(this.currentValue));
  }
}
