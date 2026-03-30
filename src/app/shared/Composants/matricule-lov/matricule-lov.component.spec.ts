import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatriculeLovComponent } from './matricule-lov.component';

describe('MatriculeLovComponent', () => {
  let component: MatriculeLovComponent;
  let fixture: ComponentFixture<MatriculeLovComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatriculeLovComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatriculeLovComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
