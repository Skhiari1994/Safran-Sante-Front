import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuletinMutuelleComponent } from './buletin-mutuelle.component';

describe('BuletinMutuelleComponent', () => {
  let component: BuletinMutuelleComponent;
  let fixture: ComponentFixture<BuletinMutuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuletinMutuelleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuletinMutuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
