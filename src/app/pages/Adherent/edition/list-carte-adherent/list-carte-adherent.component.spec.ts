import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCarteAdherentComponent } from './list-carte-adherent.component';

describe('ListCarteAdherentComponent', () => {
  let component: ListCarteAdherentComponent;
  let fixture: ComponentFixture<ListCarteAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListCarteAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListCarteAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
