import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitPlafondComponent } from './init-plafond.component';

describe('InitPlafondComponent', () => {
  let component: InitPlafondComponent;
  let fixture: ComponentFixture<InitPlafondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InitPlafondComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitPlafondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
