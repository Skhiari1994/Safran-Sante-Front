import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirBordMutComponent } from './vir-bord-mut.component';

describe('VirBordMutComponent', () => {
  let component: VirBordMutComponent;
  let fixture: ComponentFixture<VirBordMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VirBordMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VirBordMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
