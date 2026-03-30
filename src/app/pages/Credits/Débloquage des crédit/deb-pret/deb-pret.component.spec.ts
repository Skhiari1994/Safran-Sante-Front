import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebPretComponent } from './deb-pret.component';

describe('DebPretComponent', () => {
  let component: DebPretComponent;
  let fixture: ComponentFixture<DebPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
