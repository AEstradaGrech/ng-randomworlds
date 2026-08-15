import { Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatBadgeConfig } from '../../models/common-interfaces';
import { defaultButtonBadge } from 'src/app/core/constants/configs/nft-card';

@Component({
  selector: 'app-rounded-button',
  templateUrl: './rounded-button.component.html',
  styleUrl: './rounded-button.component.scss'
})
export class RoundedButtonComponent implements OnInit {

  @Input() id: string | undefined = undefined;
  @Input() iconName: string = '';
  @Input() bgImageIcon:string = 'url(assets/images/MetamaskIconBrown.png)'
  @Input() iconColor!: string;
  @Input() withSpinner: boolean = false;
  @Input() badgeValue!: number | null;
  @Input() disabled: boolean = false;
  @Input() hoverColor: string = 'var(--primary-btn-hover)';
  @Input() backgroundColor: string = 'var(--primary-btn-color)';
  @Input() borderColor: string = 'var(--primary-btn-border)';
  @Input() size: string = '40px';
  @Input() margin: string = '5px';
  @Output() onClickEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() onMousedownEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() onMouseupEvent: EventEmitter<string> = new EventEmitter<string>();

  @Input() badgeConfig!: MatBadgeConfig;

  public hiddenBadge = computed(() => {
    if(!this.badgeValue)
      return true;

    else return false;
  })
  public get iconSize() : string{
    let pixelSize: string = '20px';
    if(this.size.includes('px')){
      let value = parseFloat(this.size.split('px')[0]) * 0.5;
      pixelSize = `${value}px`;
    }
    return pixelSize;
  }
  // Defaults are set in ngOnInit, NOT ngAfterViewInit: iconColor is bound in the
  // template ([style.--icon-color]), and ngAfterViewInit runs AFTER that binding
  // is first checked, so mutating it there throws NG0100. ngOnInit runs before
  // the first view check, so the binding is consistent from the start.
  ngOnInit(): void {
    if(this.id === undefined || this.id === '')
      this.id = this.iconName;
    if(!this.iconColor || this.iconColor === '')
      this.iconColor = this.hoverColor;
    if(!this.badgeConfig)
      this.badgeConfig = defaultButtonBadge;
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
