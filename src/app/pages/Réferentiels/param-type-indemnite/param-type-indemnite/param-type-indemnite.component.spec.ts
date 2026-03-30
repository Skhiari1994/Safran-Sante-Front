import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamTypeIndemniteComponent } from './param-type-indemnite.component';

describe('ParamTypeIndemniteComponent', () => {
  let component: ParamTypeIndemniteComponent;
  let fixture: ComponentFixture<ParamTypeIndemniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamTypeIndemniteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamTypeIndemniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
