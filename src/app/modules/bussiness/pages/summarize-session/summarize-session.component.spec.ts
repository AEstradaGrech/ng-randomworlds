import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarizeSessionComponent } from './summarize-session.component';

describe('SummarizeSessionComponent', () => {
  let component: SummarizeSessionComponent;
  let fixture: ComponentFixture<SummarizeSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SummarizeSessionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SummarizeSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
