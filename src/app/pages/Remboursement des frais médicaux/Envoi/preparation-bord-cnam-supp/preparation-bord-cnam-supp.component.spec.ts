import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparationBordCnamSuppComponent } from './preparation-bord-cnam-supp.component';

describe('PreparationBordCnamSuppComponent', () => {
  let component: PreparationBordCnamSuppComponent;
  let fixture: ComponentFixture<PreparationBordCnamSuppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreparationBordCnamSuppComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreparationBordCnamSuppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
