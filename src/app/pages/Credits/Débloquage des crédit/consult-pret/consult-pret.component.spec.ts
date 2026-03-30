import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultPretComponent } from './consult-pret.component';

describe('ConsultPretComponent', () => {
  let component: ConsultPretComponent;
  let fixture: ComponentFixture<ConsultPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
