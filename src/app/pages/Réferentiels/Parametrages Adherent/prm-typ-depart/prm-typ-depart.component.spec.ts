import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmTypDepartComponent } from './prm-typ-depart.component';

describe('PrmTypDepartComponent', () => {
  let component: PrmTypDepartComponent;
  let fixture: ComponentFixture<PrmTypDepartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmTypDepartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmTypDepartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
