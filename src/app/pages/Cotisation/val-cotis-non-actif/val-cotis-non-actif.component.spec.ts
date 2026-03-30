import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValCotisNonActifComponent } from './val-cotis-non-actif.component';

describe('ValCotisNonActifComponent', () => {
  let component: ValCotisNonActifComponent;
  let fixture: ComponentFixture<ValCotisNonActifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValCotisNonActifComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValCotisNonActifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
