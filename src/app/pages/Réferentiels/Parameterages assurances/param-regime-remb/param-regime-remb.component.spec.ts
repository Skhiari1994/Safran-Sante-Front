import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRegimeRembComponent } from './param-regime-remb.component';

describe('ParamRegimeRembComponent', () => {
  let component: ParamRegimeRembComponent;
  let fixture: ComponentFixture<ParamRegimeRembComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamRegimeRembComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamRegimeRembComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
