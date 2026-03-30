import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiecePretComponent } from './piece-pret.component';

describe('PiecePretComponent', () => {
  let component: PiecePretComponent;
  let fixture: ComponentFixture<PiecePretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PiecePretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PiecePretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
