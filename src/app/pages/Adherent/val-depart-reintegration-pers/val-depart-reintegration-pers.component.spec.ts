import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValDepartReintegrationPersComponent } from './val-depart-reintegration-pers.component';

describe('ValDepartReintegrationPersComponent', () => {
  let component: ValDepartReintegrationPersComponent;
  let fixture: ComponentFixture<ValDepartReintegrationPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValDepartReintegrationPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValDepartReintegrationPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
