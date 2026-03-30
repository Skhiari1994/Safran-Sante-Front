import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajPecComponent } from './maj-pec.component';

describe('MajPecComponent', () => {
  let component: MajPecComponent;
  let fixture: ComponentFixture<MajPecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajPecComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajPecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
