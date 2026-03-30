import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisiePretSansDemComponent } from './saisie-pret-sans-dem.component';

describe('SaisiePretSansDemComponent', () => {
  let component: SaisiePretSansDemComponent;
  let fixture: ComponentFixture<SaisiePretSansDemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisiePretSansDemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisiePretSansDemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
