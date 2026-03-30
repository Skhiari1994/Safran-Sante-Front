import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamPersPhysiqueComponent } from './param-pers-physique.component';

describe('ParamPersPhysiqueComponent', () => {
  let component: ParamPersPhysiqueComponent;
  let fixture: ComponentFixture<ParamPersPhysiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamPersPhysiqueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamPersPhysiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
