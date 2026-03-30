import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieIndemniteComponent } from './saisie-indemnite.component';

describe('SaisieIndemniteComponent', () => {
  let component: SaisieIndemniteComponent;
  let fixture: ComponentFixture<SaisieIndemniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieIndemniteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisieIndemniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
