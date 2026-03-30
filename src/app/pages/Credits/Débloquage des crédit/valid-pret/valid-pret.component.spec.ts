import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidPretComponent } from './valid-pret.component';

describe('ValidPretComponent', () => {
  let component: ValidPretComponent;
  let fixture: ComponentFixture<ValidPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
