import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DFlPersScgComponent } from './dfl-pers-scg.component';

describe('DFlPersScgComponent', () => {
  let component: DFlPersScgComponent;
  let fixture: ComponentFixture<DFlPersScgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DFlPersScgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DFlPersScgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
