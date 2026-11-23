import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { MatBadgeConfig } from '../../models/common-interfaces';


@Component({
  selector: 'app-trading-button',
  templateUrl: './trading-button.component.html',
  styleUrl: './trading-button.component.scss'
})
export class TradingButtonComponent {
  title = input<string>('Pay with ETH');
  buttonText = input<string>('BUY');
  defaultEth = input<boolean>(true);
  menuTokens = input<string[]>([]);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  tooltip = input<string>('');
  tooltipPosition = input<TooltipPosition>('above');
  badgeValue = input<number | null>(null);
  size = input<string>();
  margin = input<string>();

  @Input() badgeConfig!: MatBadgeConfig;

  @Output() onTokenChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onButtonClick: EventEmitter<string> = new EventEmitter<string>();

  public onTokenChanged(selected: string){
    this.onTokenChange.emit(selected);
  }
  public onButtonClicked(token:string){
    this.onButtonClick.emit(token);
  }
}
