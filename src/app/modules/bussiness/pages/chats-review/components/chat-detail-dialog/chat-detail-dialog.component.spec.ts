import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDetailDialogComponent } from './chat-detail-dialog.component';

describe('ChatDetailDialogComponent', () => {
  let component: ChatDetailDialogComponent;
  let fixture: ComponentFixture<ChatDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
