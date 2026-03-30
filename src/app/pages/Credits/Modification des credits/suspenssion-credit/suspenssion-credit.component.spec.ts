import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspenssionCreditComponent } from './suspenssion-credit.component';

describe('SuspenssionCreditComponent', () => {
  let component: SuspenssionCreditComponent;
  let fixture: ComponentFixture<SuspenssionCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuspenssionCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuspenssionCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
