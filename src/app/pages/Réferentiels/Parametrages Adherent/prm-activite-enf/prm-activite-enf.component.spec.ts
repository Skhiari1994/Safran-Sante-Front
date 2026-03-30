import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmActiviteEnfComponent } from './prm-activite-enf.component';

describe('PrmActiviteEnfComponent', () => {
  let component: PrmActiviteEnfComponent;
  let fixture: ComponentFixture<PrmActiviteEnfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmActiviteEnfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmActiviteEnfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
