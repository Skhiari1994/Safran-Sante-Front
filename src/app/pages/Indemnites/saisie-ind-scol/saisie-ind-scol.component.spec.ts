import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieIndScolComponent } from './saisie-ind-scol.component';

describe('SaisieIndScolComponent', () => {
  let component: SaisieIndScolComponent;
  let fixture: ComponentFixture<SaisieIndScolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieIndScolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisieIndScolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
