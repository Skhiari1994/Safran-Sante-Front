import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLovComponent } from './search-lov.component';

describe('SearchLovComponent', () => {
  let component: SearchLovComponent;
  let fixture: ComponentFixture<SearchLovComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchLovComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchLovComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
