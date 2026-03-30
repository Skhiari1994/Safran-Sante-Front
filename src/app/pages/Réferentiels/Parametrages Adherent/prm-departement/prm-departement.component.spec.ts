import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmDepartementComponent } from './prm-departement.component';

describe('PrmDepartementComponent', () => {
  let component: PrmDepartementComponent;
  let fixture: ComponentFixture<PrmDepartementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmDepartementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmDepartementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
