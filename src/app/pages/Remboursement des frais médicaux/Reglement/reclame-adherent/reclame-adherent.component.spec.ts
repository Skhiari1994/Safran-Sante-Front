import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclameAdherentComponent } from './reclame-adherent.component';

describe('ReclameAdherentComponent', () => {
  let component: ReclameAdherentComponent;
  let fixture: ComponentFixture<ReclameAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReclameAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReclameAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
