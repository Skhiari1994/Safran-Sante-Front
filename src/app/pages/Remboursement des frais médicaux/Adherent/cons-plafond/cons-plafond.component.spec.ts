import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsPlafondComponent } from './cons-plafond.component';

describe('ConsPlafondComponent', () => {
  let component: ConsPlafondComponent;
  let fixture: ComponentFixture<ConsPlafondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsPlafondComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsPlafondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
