import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajValideurComponent } from './maj-valideur.component';

describe('MajValideurComponent', () => {
  let component: MajValideurComponent;
  let fixture: ComponentFixture<MajValideurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajValideurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajValideurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
