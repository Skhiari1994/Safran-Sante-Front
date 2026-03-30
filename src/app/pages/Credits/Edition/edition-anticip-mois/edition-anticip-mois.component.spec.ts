import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionAnticipMoisComponent } from './edition-anticip-mois.component';

describe('EditionAnticipMoisComponent', () => {
  let component: EditionAnticipMoisComponent;
  let fixture: ComponentFixture<EditionAnticipMoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionAnticipMoisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionAnticipMoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
