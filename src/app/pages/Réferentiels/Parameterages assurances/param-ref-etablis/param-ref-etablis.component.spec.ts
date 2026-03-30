import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRefEtablisComponent } from './param-ref-etablis.component';

describe('ParamRefEtablisComponent', () => {
  let component: ParamRefEtablisComponent;
  let fixture: ComponentFixture<ParamRefEtablisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamRefEtablisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamRefEtablisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
