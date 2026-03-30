import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionBalancePretComponent } from './edition-balance-pret.component';

describe('EditionBalancePretComponent', () => {
  let component: EditionBalancePretComponent;
  let fixture: ComponentFixture<EditionBalancePretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionBalancePretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionBalancePretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
