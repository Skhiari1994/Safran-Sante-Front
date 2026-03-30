import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuletinCNAMComponent } from './buletin-cnam.component';

describe('BuletinCNAMComponent', () => {
  let component: BuletinCNAMComponent;
  let fixture: ComponentFixture<BuletinCNAMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuletinCNAMComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuletinCNAMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
