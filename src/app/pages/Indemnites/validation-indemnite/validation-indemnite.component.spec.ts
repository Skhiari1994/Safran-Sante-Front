import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationIndemniteComponent } from './validation-indemnite.component';

describe('ValidationIndemniteComponent', () => {
  let component: ValidationIndemniteComponent;
  let fixture: ComponentFixture<ValidationIndemniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidationIndemniteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidationIndemniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
