import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirBordCnamComponent } from './vir-bord-cnam.component';

describe('VirBordCnamComponent', () => {
  let component: VirBordCnamComponent;
  let fixture: ComponentFixture<VirBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VirBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
