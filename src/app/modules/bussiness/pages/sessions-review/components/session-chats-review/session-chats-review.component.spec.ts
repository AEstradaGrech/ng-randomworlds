import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionChatsReviewComponent } from './session-chats-review.component';

describe('SessionChatsReviewComponent', () => {
  let component: SessionChatsReviewComponent;
  let fixture: ComponentFixture<SessionChatsReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionChatsReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SessionChatsReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
