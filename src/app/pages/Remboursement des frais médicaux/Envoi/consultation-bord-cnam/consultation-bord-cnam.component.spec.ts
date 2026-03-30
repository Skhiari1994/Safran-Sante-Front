import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationBordCnamComponent } from './consultation-bord-cnam.component';

describe('ConsultationBordCnamComponent', () => {
  let component: ConsultationBordCnamComponent;
  let fixture: ComponentFixture<ConsultationBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultationBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultationBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
