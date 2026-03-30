import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparCommissionPretComponent } from './prepar-commission-pret.component';

describe('PreparCommissionPretComponent', () => {
  let component: PreparCommissionPretComponent;
  let fixture: ComponentFixture<PreparCommissionPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreparCommissionPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreparCommissionPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
