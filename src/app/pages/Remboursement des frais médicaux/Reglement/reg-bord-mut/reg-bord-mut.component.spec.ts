import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegBordMutComponent } from './reg-bord-mut.component';

describe('RegBordMutComponent', () => {
  let component: RegBordMutComponent;
  let fixture: ComponentFixture<RegBordMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegBordMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegBordMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
