import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisiePretComponent } from './saisie-pret.component';

describe('SaisiePretComponent', () => {
  let component: SaisiePretComponent;
  let fixture: ComponentFixture<SaisiePretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisiePretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisiePretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
