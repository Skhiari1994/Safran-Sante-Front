import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRefActComponent } from './param-ref-act.component';

describe('ParamRefActComponent', () => {
  let component: ParamRefActComponent;
  let fixture: ComponentFixture<ParamRefActComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamRefActComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamRefActComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
