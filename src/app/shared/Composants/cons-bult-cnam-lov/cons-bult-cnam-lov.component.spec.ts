import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsBultCnamLovComponent } from './cons-bult-cnam-lov.component';

describe('ConsBultCnamLovComponent', () => {
  let component: ConsBultCnamLovComponent;
  let fixture: ComponentFixture<ConsBultCnamLovComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsBultCnamLovComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsBultCnamLovComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
