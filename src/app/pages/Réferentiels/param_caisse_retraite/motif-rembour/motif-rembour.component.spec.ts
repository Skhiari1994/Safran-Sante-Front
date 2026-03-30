import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotifRembourComponent } from './motif-rembour.component';

describe('MotifRembourComponent', () => {
  let component: MotifRembourComponent;
  let fixture: ComponentFixture<MotifRembourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MotifRembourComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MotifRembourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
