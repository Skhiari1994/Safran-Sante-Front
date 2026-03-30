import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamEtablissConventionneesComponent } from './param-etabliss-conventionnees.component';

describe('ParamEtablissConventionneesComponent', () => {
  let component: ParamEtablissConventionneesComponent;
  let fixture: ComponentFixture<ParamEtablissConventionneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamEtablissConventionneesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamEtablissConventionneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
