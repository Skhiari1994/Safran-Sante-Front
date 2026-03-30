import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieManuBordCnamComponent } from './saisie-manu-bord-cnam.component';

describe('SaisieManuBordCnamComponent', () => {
  let component: SaisieManuBordCnamComponent;
  let fixture: ComponentFixture<SaisieManuBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieManuBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisieManuBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
