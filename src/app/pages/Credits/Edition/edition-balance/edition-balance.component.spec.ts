import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionBalanceComponent } from './edition-balance.component';

describe('EditionBalanceComponent', () => {
  let component: EditionBalanceComponent;
  let fixture: ComponentFixture<EditionBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionBalanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
