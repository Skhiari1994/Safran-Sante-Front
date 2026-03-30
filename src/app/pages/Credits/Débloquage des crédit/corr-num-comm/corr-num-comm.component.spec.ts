import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrNumCommComponent } from './corr-num-comm.component';

describe('CorrNumCommComponent', () => {
  let component: CorrNumCommComponent;
  let fixture: ComponentFixture<CorrNumCommComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorrNumCommComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CorrNumCommComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
