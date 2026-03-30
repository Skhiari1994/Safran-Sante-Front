import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieCotisComponent } from './saisie-cotis.component';

describe('SaisieCotisComponent', () => {
  let component: SaisieCotisComponent;
  let fixture: ComponentFixture<SaisieCotisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieCotisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisieCotisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
