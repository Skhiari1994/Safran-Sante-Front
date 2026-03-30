import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamActeMedicauxComponent } from './param-acte-medicaux.component';

describe('ParamActeMedicauxComponent', () => {
  let component: ParamActeMedicauxComponent;
  let fixture: ComponentFixture<ParamActeMedicauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamActeMedicauxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamActeMedicauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
