import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionListIndemDeblComponent } from './edition-list-indem-debl.component';

describe('EditionListIndemDeblComponent', () => {
  let component: EditionListIndemDeblComponent;
  let fixture: ComponentFixture<EditionListIndemDeblComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionListIndemDeblComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionListIndemDeblComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
