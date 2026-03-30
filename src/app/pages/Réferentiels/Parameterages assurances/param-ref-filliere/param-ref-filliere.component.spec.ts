import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRefFilliereComponent } from './param-ref-filliere.component';

describe('ParamRefFilliereComponent', () => {
  let component: ParamRefFilliereComponent;
  let fixture: ComponentFixture<ParamRefFilliereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamRefFilliereComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamRefFilliereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
