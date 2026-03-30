import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionPretDeblcComponent } from './edition-pret-deblc.component';

describe('EditionPretDeblcComponent', () => {
  let component: EditionPretDeblcComponent;
  let fixture: ComponentFixture<EditionPretDeblcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionPretDeblcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionPretDeblcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
