import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionPretComponent } from './position-pret.component';

describe('PositionPretComponent', () => {
  let component: PositionPretComponent;
  let fixture: ComponentFixture<PositionPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PositionPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PositionPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
