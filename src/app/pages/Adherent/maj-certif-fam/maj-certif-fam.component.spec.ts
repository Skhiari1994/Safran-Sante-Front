import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajCertifFamComponent } from './maj-certif-fam.component';

describe('MajCertifFamComponent', () => {
  let component: MajCertifFamComponent;
  let fixture: ComponentFixture<MajCertifFamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajCertifFamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajCertifFamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
