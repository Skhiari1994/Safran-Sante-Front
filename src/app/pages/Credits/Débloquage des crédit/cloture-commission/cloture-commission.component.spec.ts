import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClotureCommissionComponent } from './cloture-commission.component';

describe('ClotureCommissionComponent', () => {
  let component: ClotureCommissionComponent;
  let fixture: ComponentFixture<ClotureCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClotureCommissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClotureCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
