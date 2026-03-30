import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceParTypPretComponent } from './piece-par-typ-pret.component';

describe('PieceParTypPretComponent', () => {
  let component: PieceParTypPretComponent;
  let fixture: ComponentFixture<PieceParTypPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PieceParTypPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PieceParTypPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
