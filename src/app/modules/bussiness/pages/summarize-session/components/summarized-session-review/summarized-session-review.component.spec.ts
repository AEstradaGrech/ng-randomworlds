import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarizedSessionReviewComponent } from './summarized-session-review.component';

describe('SummarizedSessionReviewComponent', () => {
  let component: SummarizedSessionReviewComponent;
  let fixture: ComponentFixture<SummarizedSessionReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SummarizedSessionReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SummarizedSessionReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
