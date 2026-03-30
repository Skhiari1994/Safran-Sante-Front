import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeblocageIndemniteComponent } from './deblocage-indemnite.component';

describe('DeblocageIndemniteComponent', () => {
  let component: DeblocageIndemniteComponent;
  let fixture: ComponentFixture<DeblocageIndemniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeblocageIndemniteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeblocageIndemniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
