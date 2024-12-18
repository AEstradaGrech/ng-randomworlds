import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSummarizationMessageComponent } from './load-summarization-message.component';

describe('LoadSummarizationMessageComponent', () => {
  let component: LoadSummarizationMessageComponent;
  let fixture: ComponentFixture<LoadSummarizationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadSummarizationMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadSummarizationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
