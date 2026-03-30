import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidRetenuMensComponent } from './valid-retenu-mens.component';

describe('ValidRetenuMensComponent', () => {
  let component: ValidRetenuMensComponent;
  let fixture: ComponentFixture<ValidRetenuMensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidRetenuMensComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidRetenuMensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
