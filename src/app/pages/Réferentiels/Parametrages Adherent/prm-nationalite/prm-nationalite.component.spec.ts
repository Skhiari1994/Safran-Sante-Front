import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmNationaliteComponent } from './prm-nationalite.component';

describe('PrmNationaliteComponent', () => {
  let component: PrmNationaliteComponent;
  let fixture: ComponentFixture<PrmNationaliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmNationaliteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmNationaliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
