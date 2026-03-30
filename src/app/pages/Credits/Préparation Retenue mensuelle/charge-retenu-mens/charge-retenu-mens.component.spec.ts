import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeRetenuMensComponent } from './charge-retenu-mens.component';

describe('ChargeRetenuMensComponent', () => {
  let component: ChargeRetenuMensComponent;
  let fixture: ComponentFixture<ChargeRetenuMensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChargeRetenuMensComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChargeRetenuMensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
