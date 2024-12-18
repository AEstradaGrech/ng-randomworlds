import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveSysMessageComponent } from './save-sys-message.component';

describe('SaveSysMessageComponent', () => {
  let component: SaveSysMessageComponent;
  let fixture: ComponentFixture<SaveSysMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveSysMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaveSysMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
