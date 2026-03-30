import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamPersonneConventionneesComponent } from './param-personne-conventionnees.component';

describe('ParamPersonneConventionneesComponent', () => {
  let component: ParamPersonneConventionneesComponent;
  let fixture: ComponentFixture<ParamPersonneConventionneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamPersonneConventionneesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamPersonneConventionneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
