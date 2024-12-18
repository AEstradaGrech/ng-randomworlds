import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsReviewComponent } from './sessions-review.component';

describe('SessionsReviewComponent', () => {
  let component: SessionsReviewComponent;
  let fixture: ComponentFixture<SessionsReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionsReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SessionsReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
