import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamMaladieComponent } from './param-maladie.component';

describe('ParamMaladieComponent', () => {
  let component: ParamMaladieComponent;
  let fixture: ComponentFixture<ParamMaladieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamMaladieComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamMaladieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
