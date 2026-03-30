import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisManDcptLibrCnamComponent } from './sais-man-dcpt-libr-cnam.component';

describe('SaisManDcptLibrCnamComponent', () => {
  let component: SaisManDcptLibrCnamComponent;
  let fixture: ComponentFixture<SaisManDcptLibrCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisManDcptLibrCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisManDcptLibrCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
