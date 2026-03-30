import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReechelonnementPretComponent } from './reechelonnement-pret.component';

describe('ReechelonnementPretComponent', () => {
  let component: ReechelonnementPretComponent;
  let fixture: ComponentFixture<ReechelonnementPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReechelonnementPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReechelonnementPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
