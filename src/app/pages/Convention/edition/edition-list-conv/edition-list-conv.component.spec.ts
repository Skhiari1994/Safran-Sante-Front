import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionListConvComponent } from './edition-list-conv.component';

describe('EditionListConvComponent', () => {
  let component: EditionListConvComponent;
  let fixture: ComponentFixture<EditionListConvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionListConvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionListConvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
