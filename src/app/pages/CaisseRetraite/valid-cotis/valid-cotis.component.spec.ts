import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidCotisComponent } from './valid-cotis.component';

describe('ValidCotisComponent', () => {
  let component: ValidCotisComponent;
  let fixture: ComponentFixture<ValidCotisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidCotisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidCotisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
