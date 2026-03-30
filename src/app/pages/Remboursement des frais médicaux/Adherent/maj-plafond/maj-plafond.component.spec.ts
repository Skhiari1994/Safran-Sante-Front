import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajPlafondComponent } from './maj-plafond.component';

describe('MajPlafondComponent', () => {
  let component: MajPlafondComponent;
  let fixture: ComponentFixture<MajPlafondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajPlafondComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajPlafondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
