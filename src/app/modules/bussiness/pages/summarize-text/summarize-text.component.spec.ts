import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarizeTextComponent } from './summarize-text.component';

describe('SummarizeTextComponent', () => {
  let component: SummarizeTextComponent;
  let fixture: ComponentFixture<SummarizeTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SummarizeTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SummarizeTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
