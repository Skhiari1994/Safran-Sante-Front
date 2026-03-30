import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRefMedComponent } from './param-ref-med.component';

describe('ParamRefMedComponent', () => {
  let component: ParamRefMedComponent;
  let fixture: ComponentFixture<ParamRefMedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamRefMedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamRefMedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
