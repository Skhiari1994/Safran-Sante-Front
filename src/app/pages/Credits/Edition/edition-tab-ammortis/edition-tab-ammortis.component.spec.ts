import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionTabAmmortisComponent } from './edition-tab-ammortis.component';

describe('EditionTabAmmortisComponent', () => {
  let component: EditionTabAmmortisComponent;
  let fixture: ComponentFixture<EditionTabAmmortisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionTabAmmortisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionTabAmmortisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
