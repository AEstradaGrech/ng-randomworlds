import { Component, EventEmitter, input, Output } from '@angular/core';


@Component({
  selector: 'app-trading-button',
  templateUrl: './trading-button.component.html',
  styleUrl: './trading-button.component.scss'
})
export class TradingButtonComponent {
  title = input<string>('Pay with ETH');
  buttonText = input<string>('BUY');
  defaultEth = input<boolean>(true);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  @Output() onButtonClick: EventEmitter<string> = new EventEmitter<string>();

  public onButtonClicked(token:string){
    this.onButtonClick.emit(token);
  }
}
