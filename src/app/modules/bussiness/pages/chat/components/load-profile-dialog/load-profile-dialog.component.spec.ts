import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadProfileDialogComponent } from './load-profile-dialog.component';

describe('LoadProfileDialogComponent', () => {
  let component: LoadProfileDialogComponent;
  let fixture: ComponentFixture<LoadProfileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadProfileDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadProfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
