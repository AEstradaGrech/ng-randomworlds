import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftVisorComponent } from './nft-visor.component';

describe('NftVisorComponent', () => {
  let component: NftVisorComponent;
  let fixture: ComponentFixture<NftVisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NftVisorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NftVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
