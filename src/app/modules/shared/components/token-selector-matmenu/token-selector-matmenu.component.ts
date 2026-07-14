import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-token-selector-matmenu',
  templateUrl: './token-selector-matmenu.component.html',
  styleUrl: './token-selector-matmenu.component.scss'
})
export class TokenSelectorMatmenuComponent implements OnChanges{

  @Input() title:string = 'ETH';
  @Input() subtitle:string = 'Select currency';
  @Input() label:string = 'Payment Token';
  @Input() buttonText:string = 'BUY';
  @Input() paymentTokens: string[] = ['ETH'];
  @Output() onTokenChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() onTokenSelected: EventEmitter<string> = new EventEmitter<string>();
  public selectedToken:string = 'ETH';
  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes["paymentTokens"]){
      let newValues = changes["paymentTokens"].currentValue;
      if(!newValues.includes("ETH"))
        this.paymentTokens = ["ETH", ...changes["paymentTokens"].currentValue];

      else this.paymentTokens = changes["paymentTokens"].currentValue;
    }
  }

  onTokenChange(event: MatRadioChange){
    this.selectedToken = event.value;
  }
  onSelectTokenClick(){
    this.onTokenSelected.emit(this.selectedToken);
  }
}
