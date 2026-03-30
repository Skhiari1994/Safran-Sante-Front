import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmSocieteComponent } from './prm-societe.component';

describe('PrmSocieteComponent', () => {
  let component: PrmSocieteComponent;
  let fixture: ComponentFixture<PrmSocieteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmSocieteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmSocieteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
