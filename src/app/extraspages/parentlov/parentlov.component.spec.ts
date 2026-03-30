import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentlovComponent } from './parentlov.component';

describe('ParentlovComponent', () => {
  let component: ParentlovComponent;
  let fixture: ComponentFixture<ParentlovComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParentlovComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParentlovComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
