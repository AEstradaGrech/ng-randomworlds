import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, TemplateRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { AssetModel } from 'src/app/core/interfaces/business/smart-contract.interface';
import { NftCardClickAction, RoundedButtonConfig, ScrollState } from '../../models/common-interfaces';

@Component({
  selector: 'app-nft-visor',
  templateUrl: './nft-visor.component.html',
  styleUrl: './nft-visor.component.scss'
})
export class NftVisorComponent implements OnInit, OnChanges{

  @Input() assets: AssetModel[] = [];
  @Input() nftCardButtonsConfig: RoundedButtonConfig[] = [];
  @Input() disabled: boolean = false;
  @Input() projectedButtonsTemplate!: TemplateRef<any>;
  @Input() skipButtonsPosition:string = 'center';
  @Input() visualization: string = 'row'; // | grid;
  @Output() onCardButtonClick: EventEmitter<NftCardClickAction> = new EventEmitter<NftCardClickAction>();

  @ViewChild('nftsContainer') nftsContainer!: ElementRef;
  public viewType: string = 'wrap';
  private _slideScrollState: ScrollState = {
      step: 100,
      mult: 1,
      direction:'',
      isScrolling:false
    }
    private _clickScrollState: ScrollState = {
      step: 100,
      mult: 10,
      direction:'',
      isScrolling:false
    }
  
  ngOnInit(): void {
    this.viewType = this.visualization === 'row' ? 'nowrap' : 'wrap';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visualization']){
      this.viewType = this.visualization === 'row' ? 'nowrap' : 'wrap';
      console.log('-- current view type --', this.viewType);
    }
  }
  
  public onCardButtonClicked(event:NftCardClickAction){
      this.onCardButtonClick.emit(event);
  }
  public onSlideViewClick(direction: string){
    if(this._slideScrollState.isScrolling) return;
    this._clickScrollState.direction = direction;
    this._clickScrollState.isScrolling = true;
    let currentScroll = this.nftsContainer.nativeElement.scrollLeft;
    let dirMult:number = this._clickScrollState.direction === 'right' ? 1 : -1;
    this.nftsContainer.nativeElement.scrollTo({
      left: currentScroll + this._clickScrollState.step * this._clickScrollState.mult * dirMult,
      behavior: 'smooth'
    })
  }
  public onSlideViewPress(direction: string){
    setTimeout(() => {
      if(this._clickScrollState.isScrolling) return;
      this._slideScrollState.direction = direction;
      this._slideScrollState.isScrolling = true;
      this._scrollVisor();
    }, 90);
  }
  public onSlideViewRelease(){
    setTimeout(()=> {
      this._slideScrollState.direction = '';
      this._slideScrollState.isScrolling = false;
      this._clickScrollState.direction = '';
      this._clickScrollState.isScrolling = false;
    }, 75);
  }
  private _scrollVisor(){
    if(this._slideScrollState.isScrolling && this._slideScrollState.direction){
      let dirMult:number = this._slideScrollState.direction === 'right' ? 1 : -1;
      this.nftsContainer.nativeElement.scrollLeft += this._slideScrollState.step * this._slideScrollState.mult * dirMult;
      setTimeout(() => {this._scrollVisor()}, 50);
    }
  }
}
