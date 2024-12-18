import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsNavBarComponent } from './tabs-nav-bar.component';

describe('TabsNavBarComponent', () => {
  let component: TabsNavBarComponent;
  let fixture: ComponentFixture<TabsNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsNavBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabsNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
