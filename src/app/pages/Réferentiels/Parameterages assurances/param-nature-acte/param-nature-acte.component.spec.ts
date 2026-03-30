import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamNatureActeComponent } from './param-nature-acte.component';

describe('ParamNatureActeComponent', () => {
  let component: ParamNatureActeComponent;
  let fixture: ComponentFixture<ParamNatureActeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamNatureActeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamNatureActeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
