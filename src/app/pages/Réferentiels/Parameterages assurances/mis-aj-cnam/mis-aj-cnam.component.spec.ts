import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAjCnamComponent } from './mis-aj-cnam.component';

describe('MisAjCnamComponent', () => {
  let component: MisAjCnamComponent;
  let fixture: ComponentFixture<MisAjCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisAjCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MisAjCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
