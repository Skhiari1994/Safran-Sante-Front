import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCarteComponent } from './list-carte.component';

describe('ListCarteComponent', () => {
  let component: ListCarteComponent;
  let fixture: ComponentFixture<ListCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListCarteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
