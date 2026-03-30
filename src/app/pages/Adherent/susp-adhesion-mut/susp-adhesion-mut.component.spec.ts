import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspAdhesionMutComponent } from './susp-adhesion-mut.component';

describe('SuspAdhesionMutComponent', () => {
  let component: SuspAdhesionMutComponent;
  let fixture: ComponentFixture<SuspAdhesionMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuspAdhesionMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuspAdhesionMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
