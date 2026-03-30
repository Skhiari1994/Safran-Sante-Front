import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisDemConvComponent } from './sais-dem-conv.component';

describe('SaisDemConvComponent', () => {
  let component: SaisDemConvComponent;
  let fixture: ComponentFixture<SaisDemConvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisDemConvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisDemConvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
