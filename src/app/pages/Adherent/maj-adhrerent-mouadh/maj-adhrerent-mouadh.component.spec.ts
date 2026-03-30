import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajAdhrerentMouadhComponent } from './maj-adhrerent-mouadh.component';

describe('MajAdhrerentMouadhComponent', () => {
  let component: MajAdhrerentMouadhComponent;
  let fixture: ComponentFixture<MajAdhrerentMouadhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MajAdhrerentMouadhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajAdhrerentMouadhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
