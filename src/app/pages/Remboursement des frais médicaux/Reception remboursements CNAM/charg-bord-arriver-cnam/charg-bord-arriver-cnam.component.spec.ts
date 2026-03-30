import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargBordArriverCNAMComponent } from './charg-bord-arriver-cnam.component';

describe('ChargBordArriverCNAMComponent', () => {
  let component: ChargBordArriverCNAMComponent;
  let fixture: ComponentFixture<ChargBordArriverCNAMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChargBordArriverCNAMComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChargBordArriverCNAMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
