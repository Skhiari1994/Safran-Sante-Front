import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidCotisPrimeMutComponent } from './valid-cotis-prime-mut.component';

describe('ValidCotisPrimeMutComponent', () => {
  let component: ValidCotisPrimeMutComponent;
  let fixture: ComponentFixture<ValidCotisPrimeMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidCotisPrimeMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidCotisPrimeMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
