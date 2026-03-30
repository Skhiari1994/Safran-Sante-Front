import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClotureIndemniteScolaireComponent } from './cloture-indemnite-scolaire.component';

describe('ClotureIndemniteScolaireComponent', () => {
  let component: ClotureIndemniteScolaireComponent;
  let fixture: ComponentFixture<ClotureIndemniteScolaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClotureIndemniteScolaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClotureIndemniteScolaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
