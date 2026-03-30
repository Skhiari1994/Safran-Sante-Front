import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspDemConvComponent } from './susp-dem-conv.component';

describe('SuspDemConvComponent', () => {
  let component: SuspDemConvComponent;
  let fixture: ComponentFixture<SuspDemConvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuspDemConvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuspDemConvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
