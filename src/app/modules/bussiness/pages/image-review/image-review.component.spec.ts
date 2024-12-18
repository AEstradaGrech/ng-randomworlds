import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageReviewComponent } from './image-review.component';

describe('ImageReviewComponent', () => {
  let component: ImageReviewComponent;
  let fixture: ComponentFixture<ImageReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
