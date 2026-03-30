import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichierRetenueMensComponent } from './fichier-retenue-mens.component';

describe('FichierRetenueMensComponent', () => {
  let component: FichierRetenueMensComponent;
  let fixture: ComponentFixture<FichierRetenueMensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FichierRetenueMensComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FichierRetenueMensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
