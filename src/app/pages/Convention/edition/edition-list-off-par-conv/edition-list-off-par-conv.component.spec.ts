import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionListOffParConvComponent } from './edition-list-off-par-conv.component';

describe('EditionListOffParConvComponent', () => {
  let component: EditionListOffParConvComponent;
  let fixture: ComponentFixture<EditionListOffParConvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionListOffParConvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionListOffParConvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
