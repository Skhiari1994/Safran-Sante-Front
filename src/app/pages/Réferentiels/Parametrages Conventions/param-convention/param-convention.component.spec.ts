import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamConventionComponent } from './param-convention.component';

describe('ParamConventionComponent', () => {
  let component: ParamConventionComponent;
  let fixture: ComponentFixture<ParamConventionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamConventionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamConventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
