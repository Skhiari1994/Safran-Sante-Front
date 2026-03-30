import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnticipationCreditComponent } from './anticipation-credit.component';

describe('AnticipationCreditComponent', () => {
  let component: AnticipationCreditComponent;
  let fixture: ComponentFixture<AnticipationCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnticipationCreditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnticipationCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
