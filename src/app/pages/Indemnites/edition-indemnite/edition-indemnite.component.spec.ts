import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionIndemniteComponent } from './edition-indemnite.component';

describe('EditionIndemniteComponent', () => {
  let component: EditionIndemniteComponent;
  let fixture: ComponentFixture<EditionIndemniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionIndemniteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionIndemniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
