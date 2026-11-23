import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedCharButtonComponent } from './locked-char-button.component';

describe('LockedCharButtonComponent', () => {
  let component: LockedCharButtonComponent;
  let fixture: ComponentFixture<LockedCharButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LockedCharButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LockedCharButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
