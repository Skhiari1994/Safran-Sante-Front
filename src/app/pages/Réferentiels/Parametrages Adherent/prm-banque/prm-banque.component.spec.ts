import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrmBanqueComponent } from './prm-banque.component';

describe('PrmBanqueComponent', () => {
  let component: PrmBanqueComponent;
  let fixture: ComponentFixture<PrmBanqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrmBanqueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrmBanqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
