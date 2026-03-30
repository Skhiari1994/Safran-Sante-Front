import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajReintegrationPersComponent } from './maj-reintegration-pers.component';

describe('MajReintegrationPersComponent', () => {
  let component: MajReintegrationPersComponent;
  let fixture: ComponentFixture<MajReintegrationPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajReintegrationPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajReintegrationPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
