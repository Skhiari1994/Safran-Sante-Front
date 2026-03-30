import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegAutoConvComponent } from './reg-auto-conv.component';

describe('RegAutoConvComponent', () => {
  let component: RegAutoConvComponent;
  let fixture: ComponentFixture<RegAutoConvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegAutoConvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegAutoConvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
