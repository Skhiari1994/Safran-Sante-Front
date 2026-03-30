import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAdhesionSuspenduComponent } from './list-adhesion-suspendu.component';

describe('ListAdhesionSuspenduComponent', () => {
  let component: ListAdhesionSuspenduComponent;
  let fixture: ComponentFixture<ListAdhesionSuspenduComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListAdhesionSuspenduComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListAdhesionSuspenduComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
