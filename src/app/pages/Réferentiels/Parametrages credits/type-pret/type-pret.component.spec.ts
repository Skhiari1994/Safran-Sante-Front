import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePretComponent } from './type-pret.component';

describe('TypePretComponent', () => {
  let component: TypePretComponent;
  let fixture: ComponentFixture<TypePretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypePretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypePretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
