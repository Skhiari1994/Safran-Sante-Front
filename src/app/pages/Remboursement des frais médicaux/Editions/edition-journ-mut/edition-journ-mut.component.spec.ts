import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionJournMutComponent } from './edition-journ-mut.component';

describe('EditionJournMutComponent', () => {
  let component: EditionJournMutComponent;
  let fixture: ComponentFixture<EditionJournMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionJournMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionJournMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
