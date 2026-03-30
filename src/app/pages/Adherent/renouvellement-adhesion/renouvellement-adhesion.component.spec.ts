import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenouvellementAdhesionComponent } from './renouvellement-adhesion.component';

describe('RenouvellementAdhesionComponent', () => {
  let component: RenouvellementAdhesionComponent;
  let fixture: ComponentFixture<RenouvellementAdhesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenouvellementAdhesionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RenouvellementAdhesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
