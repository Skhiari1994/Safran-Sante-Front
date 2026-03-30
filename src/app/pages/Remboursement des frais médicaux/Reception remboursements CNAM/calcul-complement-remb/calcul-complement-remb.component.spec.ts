import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculComplementRembComponent } from './calcul-complement-remb.component';

describe('CalculComplementRembComponent', () => {
  let component: CalculComplementRembComponent;
  let fixture: ComponentFixture<CalculComplementRembComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculComplementRembComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculComplementRembComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
