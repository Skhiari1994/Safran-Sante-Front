import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsBultMutLovComponent } from './cons-bult-mut-lov.component';

describe('ConsBultMutLovComponent', () => {
  let component: ConsBultMutLovComponent;
  let fixture: ComponentFixture<ConsBultMutLovComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsBultMutLovComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsBultMutLovComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
