import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamIdentificationMutComponent } from './param-identification-mut.component';

describe('ParamIdentificationMutComponent', () => {
  let component: ParamIdentificationMutComponent;
  let fixture: ComponentFixture<ParamIdentificationMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamIdentificationMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamIdentificationMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
