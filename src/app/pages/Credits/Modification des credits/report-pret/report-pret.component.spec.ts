import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPretComponent } from './report-pret.component';

describe('ReportPretComponent', () => {
  let component: ReportPretComponent;
  let fixture: ComponentFixture<ReportPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
