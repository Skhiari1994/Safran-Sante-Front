import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparationBordMutComponent } from './preparation-bord-mut.component';

describe('PreparationBordMutComponent', () => {
  let component: PreparationBordMutComponent;
  let fixture: ComponentFixture<PreparationBordMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreparationBordMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreparationBordMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
