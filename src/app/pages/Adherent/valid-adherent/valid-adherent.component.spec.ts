import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidAdherentComponent } from './valid-adherent.component';

describe('ValidAdherentComponent', () => {
  let component: ValidAdherentComponent;
  let fixture: ComponentFixture<ValidAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
