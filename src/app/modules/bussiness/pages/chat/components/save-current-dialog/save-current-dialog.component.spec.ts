import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveCurrentDialogComponent } from './save-current-dialog.component';

describe('SaveCurrentDialogComponent', () => {
  let component: SaveCurrentDialogComponent;
  let fixture: ComponentFixture<SaveCurrentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveCurrentDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaveCurrentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
