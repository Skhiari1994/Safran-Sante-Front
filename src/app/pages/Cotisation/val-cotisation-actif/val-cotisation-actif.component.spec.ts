import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValCotisationActifComponent } from './val-cotisation-actif.component';

describe('ValCotisationActifComponent', () => {
  let component: ValCotisationActifComponent;
  let fixture: ComponentFixture<ValCotisationActifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValCotisationActifComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValCotisationActifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
