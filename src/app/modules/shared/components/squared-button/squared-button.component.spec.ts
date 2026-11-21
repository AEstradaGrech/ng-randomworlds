import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquaredButtonComponent } from './squared-button.component';

describe('SquaredButtonComponent', () => {
  let component: SquaredButtonComponent;
  let fixture: ComponentFixture<SquaredButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SquaredButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SquaredButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
