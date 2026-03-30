import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValPrimeRetraiteComponent } from './val-prime-retraite.component';

describe('ValPrimeRetraiteComponent', () => {
  let component: ValPrimeRetraiteComponent;
  let fixture: ComponentFixture<ValPrimeRetraiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValPrimeRetraiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValPrimeRetraiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
