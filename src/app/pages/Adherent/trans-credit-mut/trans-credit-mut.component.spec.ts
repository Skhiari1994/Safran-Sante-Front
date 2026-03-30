import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransCreditMutComponent } from './trans-credit-mut.component';

describe('TransCreditMutComponent', () => {
  let component: TransCreditMutComponent;
  let fixture: ComponentFixture<TransCreditMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransCreditMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransCreditMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
