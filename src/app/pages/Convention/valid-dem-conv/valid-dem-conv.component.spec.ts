import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidDemConvComponent } from './valid-dem-conv.component';

describe('ValidDemConvComponent', () => {
  let component: ValidDemConvComponent;
  let fixture: ComponentFixture<ValidDemConvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidDemConvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidDemConvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
