import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveSummaryComponent } from './save-summary.component';

describe('SaveSummaryComponent', () => {
  let component: SaveSummaryComponent;
  let fixture: ComponentFixture<SaveSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaveSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
