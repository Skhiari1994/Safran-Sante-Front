import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidAutoPrimeMutComponent } from './valid-auto-prime-mut.component';

describe('ValidAutoPrimeMutComponent', () => {
  let component: ValidAutoPrimeMutComponent;
  let fixture: ComponentFixture<ValidAutoPrimeMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidAutoPrimeMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidAutoPrimeMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
