import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeRetraiteComponent } from './prime-retraite.component';

describe('PrimeRetraiteComponent', () => {
  let component: PrimeRetraiteComponent;
  let fixture: ComponentFixture<PrimeRetraiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrimeRetraiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeRetraiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
