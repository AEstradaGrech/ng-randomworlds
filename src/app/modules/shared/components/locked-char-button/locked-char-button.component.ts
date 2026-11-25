import { AfterViewInit, Component, computed, EventEmitter, inject, Input, input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { AssetModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { SquaredButtonConfig } from '../squared-button/squared-button.model';
import { appSquaredButton } from 'src/app/core/constants/configs/squared-button';
import { TooltipPosition } from '@angular/material/tooltip';
import { MatBadgePosition } from '@angular/material/badge';
import { MatBadgeConfig } from '../../models/common-interfaces';
import { ClockService } from '../../services/clock.service';

@Component({
  selector: 'app-locked-char-button',
  templateUrl: './locked-char-button.component.html',
  styleUrl: './locked-char-button.component.scss'
})
export class LockedCharButtonComponent  {
 
  model = input.required<AssetModel>();
  disabled = input<boolean>();
  loading = input<boolean>();
  tooltip = input<string>('');
  tooltipPosition = input<TooltipPosition>('above');
  badgeValue = input<number | null>(null);
  size = input<string>();
  margin = input<string>();

  private _clock: ClockService = inject(ClockService);

  lockedUntil = computed<Date | null>(() => {
    let unixLockDate = this.model().lockedUntil;
    console.log('UNIX SIGNAL',unixLockDate);
    console.log('LOCKED UNTIL', new Date(unixLockDate ?? 1* 1000));
    //return new Date(1795631220 * 1000);
    return unixLockDate ? new Date(unixLockDate) : new Date();
  });

  readonly remainingMs = computed(() =>{
    let releaseDate = this.lockedUntil();
    return releaseDate ? Math.max(0, releaseDate.getTime() - this._clock.now()) : 0;
  })

  isLocked = computed(() => this.remainingMs() ?? 0 > 0);

  unlocksIn = computed(() =>{
    const seconds = Math.ceil(this.remainingMs() ?? 0 / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  
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
