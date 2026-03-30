import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidMntAnticipComponent } from './valid-mnt-anticip.component';

describe('ValidMntAnticipComponent', () => {
  let component: ValidMntAnticipComponent;
  let fixture: ComponentFixture<ValidMntAnticipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidMntAnticipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidMntAnticipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
