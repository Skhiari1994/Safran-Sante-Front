import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieLibreCnamComponent } from './saisie-libre-cnam.component';

describe('SaisieLibreCnamComponent', () => {
  let component: SaisieLibreCnamComponent;
  let fixture: ComponentFixture<SaisieLibreCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieLibreCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisieLibreCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
