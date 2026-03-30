import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsBuletinMutuelleComponent } from './cons-buletin-mutuelle.component';

describe('ConsBuletinMutuelleComponent', () => {
  let component: ConsBuletinMutuelleComponent;
  let fixture: ComponentFixture<ConsBuletinMutuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsBuletinMutuelleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsBuletinMutuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
