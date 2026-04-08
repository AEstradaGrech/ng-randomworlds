import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-rounded-button',
  templateUrl: './rounded-button.component.html',
  styleUrl: './rounded-button.component.scss'
})
export class RoundedButtonComponent implements AfterViewInit {

  @Input() id: string | undefined = undefined;
  @Input() iconName: string = 'keyboard_return';
  @Input() iconColor!: string;
  @Input() withSpinner: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hoverColor: string = 'var(--primary-btn-hover)';
  @Input() backgroundColor: string = 'var(--primary-btn-color)';
  @Input() borderColor: string = 'var(--primary-btn-border)';
  @Output() onClickEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() onMousedownEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() onMouseupEvent: EventEmitter<string> = new EventEmitter<string>();

  ngAfterViewInit(): void {
    if(this.id === undefined || this.id === '')
      this.id = this.iconName;
    if(!this.iconColor || this.iconColor === '')
      this.iconColor = this.hoverColor;
  }

  public onClick(): void {
    if(!this.disabled)
      this.onClickEvent.emit(this.id);
  }
  public onMousedown(): void {
    this.onMousedownEvent.emit(this.id);
  }
  public onMouseup(): void {
    this.onMouseupEvent.emit(this.id);
  }
}
