import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajDepartPersComponent } from './maj-depart-pers.component';

describe('MajDepartPersComponent', () => {
  let component: MajDepartPersComponent;
  let fixture: ComponentFixture<MajDepartPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajDepartPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajDepartPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
