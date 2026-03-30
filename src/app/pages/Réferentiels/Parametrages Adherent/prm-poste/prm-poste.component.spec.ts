import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmPosteComponent } from './prm-poste.component';

describe('PrmPosteComponent', () => {
  let component: PrmPosteComponent;
  let fixture: ComponentFixture<PrmPosteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmPosteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmPosteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
