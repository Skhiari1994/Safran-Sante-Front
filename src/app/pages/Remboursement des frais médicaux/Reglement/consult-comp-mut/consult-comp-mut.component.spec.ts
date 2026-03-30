import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultCompMutComponent } from './consult-comp-mut.component';

describe('ConsultCompMutComponent', () => {
  let component: ConsultCompMutComponent;
  let fixture: ComponentFixture<ConsultCompMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultCompMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultCompMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
