import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamActiviteEtablisComponent } from './param-activite-etablis.component';

describe('ParamActiviteEtablisComponent', () => {
  let component: ParamActiviteEtablisComponent;
  let fixture: ComponentFixture<ParamActiviteEtablisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamActiviteEtablisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamActiviteEtablisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
