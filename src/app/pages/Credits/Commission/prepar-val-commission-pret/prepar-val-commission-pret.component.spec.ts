import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparValCommissionPretComponent } from './prepar-val-commission-pret.component';

describe('PreparValCommissionPretComponent', () => {
  let component: PreparValCommissionPretComponent;
  let fixture: ComponentFixture<PreparValCommissionPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreparValCommissionPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreparValCommissionPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
