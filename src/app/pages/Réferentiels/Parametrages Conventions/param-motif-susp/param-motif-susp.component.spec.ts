import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamMotifSuspComponent } from './param-motif-susp.component';

describe('ParamMotifSuspComponent', () => {
  let component: ParamMotifSuspComponent;
  let fixture: ComponentFixture<ParamMotifSuspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamMotifSuspComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamMotifSuspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
