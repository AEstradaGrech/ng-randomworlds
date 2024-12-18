import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SysMsgDetailComponent } from './sys-msg-detail.component';

describe('SysMsgDetailComponent', () => {
  let component: SysMsgDetailComponent;
  let fixture: ComponentFixture<SysMsgDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SysMsgDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SysMsgDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
