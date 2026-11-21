import { Component, computed, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { SquaredButtonConfig } from './squared-button.model';
import { defaultSquaredButton } from 'src/app/core/constants/configs/squared-button';

@Component({
  selector: 'app-squared-button',
  templateUrl: './squared-button.component.html',
  styleUrl: './squared-button.component.scss'
})
export class SquaredButtonComponent {

  loading = input.required<boolean>();

  @Input() outline!:boolean;
  @Input() disable!:boolean;
  @Input() danger!:boolean;
  @Input() text:string = "Accept"
  @Input() loadingDiameter: number = 32;
  config = input<SquaredButtonConfig>();

  @Output() onClick: EventEmitter<string>  = new EventEmitter<string>();

  configuration = computed(() => {
    return this.config() ?? defaultSquaredButton;
  })

  disabled = computed(() => {
    return this.loading() || this.disable
  })

  public onClicked(){
    this.onClick.emit(this.text);
  }
}
