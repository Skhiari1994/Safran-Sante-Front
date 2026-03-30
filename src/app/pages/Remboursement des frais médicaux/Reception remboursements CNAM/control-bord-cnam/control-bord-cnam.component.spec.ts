import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlBordCnamComponent } from './control-bord-cnam.component';

describe('ControlBordCnamComponent', () => {
  let component: ControlBordCnamComponent;
  let fixture: ComponentFixture<ControlBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControlBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControlBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
