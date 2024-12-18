import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSessionDialogComponent } from './load-session-dialog.component';

describe('LoadSessionDialogComponent', () => {
  let component: LoadSessionDialogComponent;
  let fixture: ComponentFixture<LoadSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadSessionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
