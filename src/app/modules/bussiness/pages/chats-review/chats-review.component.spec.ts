import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsReviewComponent } from './chats-review.component';

describe('ChatsReviewComponent', () => {
  let component: ChatsReviewComponent;
  let fixture: ComponentFixture<ChatsReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatsReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatsReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
