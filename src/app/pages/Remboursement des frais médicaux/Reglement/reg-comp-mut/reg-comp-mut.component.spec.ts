import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegCompMutComponent } from './reg-comp-mut.component';

describe('RegCompMutComponent', () => {
  let component: RegCompMutComponent;
  let fixture: ComponentFixture<RegCompMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegCompMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegCompMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
