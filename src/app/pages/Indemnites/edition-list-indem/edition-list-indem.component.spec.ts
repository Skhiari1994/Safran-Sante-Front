import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionListIndemComponent } from './edition-list-indem.component';

describe('EditionListIndemComponent', () => {
  let component: EditionListIndemComponent;
  let fixture: ComponentFixture<EditionListIndemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionListIndemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionListIndemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
