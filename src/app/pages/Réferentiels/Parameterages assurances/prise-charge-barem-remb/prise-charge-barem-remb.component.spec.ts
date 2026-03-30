import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriseChargeBaremRembComponent } from './prise-charge-barem-remb.component';

describe('PriseChargeBaremRembComponent', () => {
  let component: PriseChargeBaremRembComponent;
  let fixture: ComponentFixture<PriseChargeBaremRembComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriseChargeBaremRembComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriseChargeBaremRembComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
