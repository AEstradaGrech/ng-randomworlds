import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-rounded-button',
  templateUrl: './rounded-button.component.html',
  styleUrl: './rounded-button.component.scss'
})
export class RoundedButtonComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    if(!this.iconColor)
      this.iconColor = this.hoverColor;
  }
  @Input() iconName: string = 'keyboard_return';
  @Input() iconColor!: string;
  @Input() withSpinner: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hoverColor: string = 'var(--primary-btn-hover)';
  @Input() backgroundColor: string = 'var(--primary-btn-color)';
  @Input() borderColor: string = 'var(--primary-btn-border)';
  @Output() onClickEvent: EventEmitter<void> = new EventEmitter<void>();

  public onClick(): void {
    if(!this.disabled)
      this.onClickEvent.emit();
  }
}
