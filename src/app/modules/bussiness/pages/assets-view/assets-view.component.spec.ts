import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsViewComponent } from './assets-view.component';

describe('AssetsViewComponent', () => {
  let component: AssetsViewComponent;
  let fixture: ComponentFixture<AssetsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetsViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
