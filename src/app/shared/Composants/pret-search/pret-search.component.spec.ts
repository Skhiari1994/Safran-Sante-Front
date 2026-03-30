import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretSearchComponent } from './pret-search.component';

describe('PretSearchComponent', () => {
  let component: PretSearchComponent;
  let fixture: ComponentFixture<PretSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PretSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PretSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
