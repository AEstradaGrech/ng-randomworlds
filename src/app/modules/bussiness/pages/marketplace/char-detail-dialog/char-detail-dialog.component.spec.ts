import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharDetailDialogComponent } from './char-detail-dialog.component';

describe('CharDetailDialogComponent', () => {
  let component: CharDetailDialogComponent;
  let fixture: ComponentFixture<CharDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CharDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CharDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
