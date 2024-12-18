import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-generic-button',
  templateUrl: './generic-button.component.html',
  styleUrl: './generic-button.component.scss'
})
export class GenericButtonComponent implements OnInit {
  ngOnInit(): void {
    
  }

  @Input() type:string = '';
  @Input() text:string = '';
  @Input() color:string = '';
  @Input() disabled:boolean = false;
  @Input() loading: boolean = false;

  @Output() onClick = new EventEmitter<any>();
  @Output() onFileSelected = new EventEmitter<any>();

  public onBtnClick(){
    this.onClick.emit();
  }

  public onFileSelect(event:any){
    this.onFileSelected.emit(event);
  }
}
