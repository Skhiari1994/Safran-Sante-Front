import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajAffiliationComponent } from './maj-affiliation.component';

describe('MajAffiliationComponent', () => {
  let component: MajAffiliationComponent;
  let fixture: ComponentFixture<MajAffiliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajAffiliationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajAffiliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
