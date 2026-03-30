import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefVisiteComponent } from './ref-visite.component';

describe('RefVisiteComponent', () => {
  let component: RefVisiteComponent;
  let fixture: ComponentFixture<RefVisiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefVisiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefVisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
