import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CptVirBordMutComponent } from './cpt-vir-bord-mut.component';

describe('CptVirBordMutComponent', () => {
  let component: CptVirBordMutComponent;
  let fixture: ComponentFixture<CptVirBordMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CptVirBordMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CptVirBordMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
