import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglementAutomatiqueCreditComponent } from './reglement-automatique-credit.component';

describe('ReglementAutomatiqueCreditComponent', () => {
  let component: ReglementAutomatiqueCreditComponent;
  let fixture: ComponentFixture<ReglementAutomatiqueCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReglementAutomatiqueCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReglementAutomatiqueCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
