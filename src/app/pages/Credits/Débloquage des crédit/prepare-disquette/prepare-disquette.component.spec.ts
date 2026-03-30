import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepareDisquetteComponent } from './prepare-disquette.component';

describe('PrepareDisquetteComponent', () => {
  let component: PrepareDisquetteComponent;
  let fixture: ComponentFixture<PrepareDisquetteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrepareDisquetteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrepareDisquetteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
