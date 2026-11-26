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
    return unixLockDate ? new Date(unixLockDate * 1000) : new Date();
  });

  readonly remainingMs = computed(() =>{
    let releaseDate = this.lockedUntil();
    return releaseDate ? Math.max(0, releaseDate.getTime() - this._clock.now()) : 0;
  })

  isLocked = computed(() => {
    let locked = this.remainingMs() ?? (0 > 0)
    
    if(!locked && this.model().isLocked && !this.disabled() && this.model().lockedUntil){
      this.model().isLocked = false;
      this.onCountdownFinish.emit(this.model());
    }
    
    return locked;
  });

  unlocksIn = computed(() =>{
    const s = Math.ceil(this.remainingMs() / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
  });

  
  @Input() badgeConfig!: MatBadgeConfig;

  @Output() onAbandonClick: EventEmitter<AssetModel> = new EventEmitter<AssetModel>();
  @Output() onContinueClick: EventEmitter<AssetModel> = new EventEmitter<AssetModel>();
  @Output() onCountdownFinish: EventEmitter<AssetModel> = new EventEmitter<AssetModel>();

  public squaredButtonConfig: SquaredButtonConfig = appSquaredButton;

  public onAbandonClicked(){
    this.onAbandonClick.emit(this.model());
  }
  public onContinueClicked(){
    this.onContinueClick.emit(this.model());
  }
}
