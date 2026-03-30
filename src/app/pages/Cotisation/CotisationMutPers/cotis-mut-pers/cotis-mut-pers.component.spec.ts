import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotisMutPersComponent } from './cotis-mut-pers.component';

describe('CotisMutPersComponent', () => {
  let component: CotisMutPersComponent;
  let fixture: ComponentFixture<CotisMutPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CotisMutPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CotisMutPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
