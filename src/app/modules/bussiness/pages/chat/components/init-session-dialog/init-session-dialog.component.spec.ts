import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitSessionDialogComponent } from './init-session-dialog.component';

describe('InitSessionDialogComponent', () => {
  let component: InitSessionDialogComponent;
  let fixture: ComponentFixture<InitSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InitSessionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
