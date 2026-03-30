import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgPretComponent } from './org-pret.component';

describe('OrgPretComponent', () => {
  let component: OrgPretComponent;
  let fixture: ComponentFixture<OrgPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrgPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrgPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
