import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CptVirBordCnamComponent } from './cpt-vir-bord-cnam.component';

describe('CptVirBordCnamComponent', () => {
  let component: CptVirBordCnamComponent;
  let fixture: ComponentFixture<CptVirBordCnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CptVirBordCnamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CptVirBordCnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
