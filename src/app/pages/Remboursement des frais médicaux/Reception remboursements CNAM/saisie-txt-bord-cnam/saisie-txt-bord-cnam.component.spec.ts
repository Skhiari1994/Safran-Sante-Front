import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieTxtBordCnamComponent } from './saisie-txt-bord-cnam.component';

describe('SaisieTxtBordCnamComponent', () => {
  let component: SaisieTxtBordCnamComponent;
  let fixture: ComponentFixture<SaisieTxtBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieTxtBordCnamComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SaisieTxtBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
