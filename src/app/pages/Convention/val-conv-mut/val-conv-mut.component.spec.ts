import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValConvMutComponent } from './val-conv-mut.component';

describe('ValConvMutComponent', () => {
  let component: ValConvMutComponent;
  let fixture: ComponentFixture<ValConvMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValConvMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValConvMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
