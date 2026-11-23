import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingButtonComponent } from './trading-button.component';

describe('TradingButtonComponent', () => {
  let component: TradingButtonComponent;
  let fixture: ComponentFixture<TradingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradingButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TradingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
