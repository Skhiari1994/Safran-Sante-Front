import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirementIndemniteComponent } from './virement-indemnite.component';

describe('VirementIndemniteComponent', () => {
  let component: VirementIndemniteComponent;
  let fixture: ComponentFixture<VirementIndemniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirementIndemniteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VirementIndemniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
