import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamCaisseComponent } from './param-caisse.component';

describe('ParamCaisseComponent', () => {
  let component: ParamCaisseComponent;
  let fixture: ComponentFixture<ParamCaisseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParamCaisseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParamCaisseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
