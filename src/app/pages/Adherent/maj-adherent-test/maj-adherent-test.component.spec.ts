import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajAdherentTestComponent } from './maj-adherent-test.component';

describe('MajAdherentTestComponent', () => {
  let component: MajAdherentTestComponent;
  let fixture: ComponentFixture<MajAdherentTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajAdherentTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajAdherentTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
