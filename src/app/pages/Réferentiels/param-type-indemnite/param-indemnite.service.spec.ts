import { TestBed } from '@angular/core/testing';

import { ParamIndemniteService } from './param-indemnite.service';

describe('ParamIndemniteService', () => {
  let service: ParamIndemniteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParamIndemniteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
