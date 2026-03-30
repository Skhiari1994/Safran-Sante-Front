import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionRecapRembAdhComponent } from './edition-recap-remb-adh.component';

describe('EditionRecapRembAdhComponent', () => {
  let component: EditionRecapRembAdhComponent;
  let fixture: ComponentFixture<EditionRecapRembAdhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionRecapRembAdhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionRecapRembAdhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
