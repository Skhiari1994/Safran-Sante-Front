import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparationBordCnamComponent } from './preparation-bord-cnam.component';

describe('PreparationBordCnamComponent', () => {
  let component: PreparationBordCnamComponent;
  let fixture: ComponentFixture<PreparationBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreparationBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreparationBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
