import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRefAppareilComponent } from './param-ref-appareil.component';

describe('ParamRefAppareilComponent', () => {
  let component: ParamRefAppareilComponent;
  let fixture: ComponentFixture<ParamRefAppareilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamRefAppareilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamRefAppareilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
