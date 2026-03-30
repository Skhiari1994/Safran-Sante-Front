import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDepartPersComponent } from './liste-depart-pers.component';

describe('ListeDepartPersComponent', () => {
  let component: ListeDepartPersComponent;
  let fixture: ComponentFixture<ListeDepartPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeDepartPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListeDepartPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
