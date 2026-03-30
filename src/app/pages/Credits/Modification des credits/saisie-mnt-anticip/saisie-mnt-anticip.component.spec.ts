import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieMntAnticipComponent } from './saisie-mnt-anticip.component';

describe('SaisieMntAnticipComponent', () => {
  let component: SaisieMntAnticipComponent;
  let fixture: ComponentFixture<SaisieMntAnticipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaisieMntAnticipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisieMntAnticipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
