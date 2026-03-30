import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajDossMldComponent } from './maj-doss-mld.component';

describe('MajDossMldComponent', () => {
  let component: MajDossMldComponent;
  let fixture: ComponentFixture<MajDossMldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajDossMldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajDossMldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
