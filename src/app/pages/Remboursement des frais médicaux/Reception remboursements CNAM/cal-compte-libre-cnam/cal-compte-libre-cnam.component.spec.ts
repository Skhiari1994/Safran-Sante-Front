import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalCompteLibreCnamComponent } from './cal-compte-libre-cnam.component';

describe('CalCompteLibreCnamComponent', () => {
  let component: CalCompteLibreCnamComponent;
  let fixture: ComponentFixture<CalCompteLibreCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalCompteLibreCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalCompteLibreCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
