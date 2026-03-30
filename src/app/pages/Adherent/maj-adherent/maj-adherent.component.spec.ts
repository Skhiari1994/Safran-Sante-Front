import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajAdherentComponent } from './maj-adherent.component';

describe('MajAdherentComponent', () => {
  let component: MajAdherentComponent;
  let fixture: ComponentFixture<MajAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
