import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { AssetModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { SquaredButtonConfig } from '../squared-button/squared-button.model';
import { appSquaredButton } from 'src/app/core/constants/configs/squared-button';
import { TooltipPosition } from '@angular/material/tooltip';
import { MatBadgePosition } from '@angular/material/badge';
import { MatBadgeConfig } from '../../models/common-interfaces';

@Component({
  selector: 'app-locked-char-button',
  templateUrl: './locked-char-button.component.html',
  styleUrl: './locked-char-button.component.scss'
})
export class LockedCharButtonComponent {
  model = input.required<AssetModel>();
  disabled = input<boolean>();
  loading = input<boolean>();
  tooltip = input<string>('');
  tooltipPosition = input<TooltipPosition>('above');
  badgeValue = input<number | null>(null);
  size = input<string>();
  margin = input<string>();

  @Input() badgeConfig!: MatBadgeConfig;

  @Output() onAbandonClick: EventEmitter<AssetModel> = new EventEmitter<AssetModel>();
  @Output() onContinueClick: EventEmitter<AssetModel> = new EventEmitter<AssetModel>();
  
  public squaredButtonConfig: SquaredButtonConfig = appSquaredButton;

  public onAbandonClicked(){
    this.onAbandonClick.emit(this.model());
  }
  public onContinueClicked(){
    this.onContinueClick.emit(this.model());
  }
}
