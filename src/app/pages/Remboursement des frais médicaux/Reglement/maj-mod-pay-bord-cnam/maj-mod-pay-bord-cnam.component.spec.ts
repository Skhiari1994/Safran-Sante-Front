import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajModPayBordCnamComponent } from './maj-mod-pay-bord-cnam.component';

describe('MajModPayBordCnamComponent', () => {
  let component: MajModPayBordCnamComponent;
  let fixture: ComponentFixture<MajModPayBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajModPayBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajModPayBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
