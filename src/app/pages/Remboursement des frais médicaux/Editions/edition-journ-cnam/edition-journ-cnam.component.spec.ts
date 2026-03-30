import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionJournCNAMComponent } from './edition-journ-cnam.component';

describe('EditionJournCNAMComponent', () => {
  let component: EditionJournCNAMComponent;
  let fixture: ComponentFixture<EditionJournCNAMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionJournCNAMComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionJournCNAMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
