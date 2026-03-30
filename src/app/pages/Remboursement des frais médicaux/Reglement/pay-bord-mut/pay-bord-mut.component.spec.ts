import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayBordMutComponent } from './pay-bord-mut.component';

describe('PayBordMutComponent', () => {
  let component: PayBordMutComponent;
  let fixture: ComponentFixture<PayBordMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayBordMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayBordMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
