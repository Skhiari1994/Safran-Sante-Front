import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionSuspMoisComponent } from './edition-susp-mois.component';

describe('EditionSuspMoisComponent', () => {
  let component: EditionSuspMoisComponent;
  let fixture: ComponentFixture<EditionSuspMoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionSuspMoisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionSuspMoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
