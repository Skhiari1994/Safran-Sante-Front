import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsBultCnamComponent } from './cons-bult-cnam.component';

describe('ConsBultCnamComponent', () => {
  let component: ConsBultCnamComponent;
  let fixture: ComponentFixture<ConsBultCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsBultCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsBultCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
