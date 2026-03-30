import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmAffectationComponent } from './prm-affectation.component';

describe('PrmAffectationComponent', () => {
  let component: PrmAffectationComponent;
  let fixture: ComponentFixture<PrmAffectationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmAffectationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmAffectationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
