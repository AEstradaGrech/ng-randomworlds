import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestViewComponent } from './quest-view.component';

describe('QuestViewComponent', () => {
  let component: QuestViewComponent;
  let fixture: ComponentFixture<QuestViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
