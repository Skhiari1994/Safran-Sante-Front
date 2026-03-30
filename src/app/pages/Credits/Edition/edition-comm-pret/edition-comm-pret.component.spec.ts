import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionCommPretComponent } from './edition-comm-pret.component';

describe('EditionCommPretComponent', () => {
  let component: EditionCommPretComponent;
  let fixture: ComponentFixture<EditionCommPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionCommPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionCommPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
