import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieAutoBordCnamComponent } from './saisie-auto-bord-cnam.component';

describe('SaisieAutoBordCnamComponent', () => {
  let component: SaisieAutoBordCnamComponent;
  let fixture: ComponentFixture<SaisieAutoBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieAutoBordCnamComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SaisieAutoBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
