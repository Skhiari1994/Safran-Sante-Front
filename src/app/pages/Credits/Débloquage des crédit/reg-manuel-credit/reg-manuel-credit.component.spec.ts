import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegManuelCreditComponent } from './reg-manuel-credit.component';

describe('RegManuelCreditComponent', () => {
  let component: RegManuelCreditComponent;
  let fixture: ComponentFixture<RegManuelCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegManuelCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegManuelCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
