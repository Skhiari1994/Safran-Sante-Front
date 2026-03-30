import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CptCheqBordMutComponent } from './cpt-cheq-bord-mut.component';

describe('CptCheqBordMutComponent', () => {
  let component: CptCheqBordMutComponent;
  let fixture: ComponentFixture<CptCheqBordMutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CptCheqBordMutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CptCheqBordMutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
