import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdventureViewComponent } from './adventure-view.component';

describe('AdventureViewComponent', () => {
  let component: AdventureViewComponent;
  let fixture: ComponentFixture<AdventureViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdventureViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdventureViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
