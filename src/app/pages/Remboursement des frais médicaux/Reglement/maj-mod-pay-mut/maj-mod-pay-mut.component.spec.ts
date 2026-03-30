import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajModPayMutComponent } from './maj-mod-pay-mut.component';

describe('MajModPayMutComponent', () => {
  let component: MajModPayMutComponent;
  let fixture: ComponentFixture<MajModPayMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajModPayMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajModPayMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
