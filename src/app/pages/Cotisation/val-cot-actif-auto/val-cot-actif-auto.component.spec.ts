import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValCotActifAutoComponent } from './val-cot-actif-auto.component';

describe('ValCotActifAutoComponent', () => {
  let component: ValCotActifAutoComponent;
  let fixture: ComponentFixture<ValCotActifAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValCotActifAutoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValCotActifAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
