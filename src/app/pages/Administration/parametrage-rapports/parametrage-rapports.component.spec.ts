import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageRapportsComponent } from './parametrage-rapports.component';

describe('ParametrageRapportsComponent', () => {
  let component: ParametrageRapportsComponent;
  let fixture: ComponentFixture<ParametrageRapportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParametrageRapportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParametrageRapportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
