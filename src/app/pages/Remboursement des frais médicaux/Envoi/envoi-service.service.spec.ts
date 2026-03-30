import { TestBed } from '@angular/core/testing';

import { EnvoiServiceService } from './envoi-service.service';

describe('EnvoiServiceService', () => {
  let service: EnvoiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvoiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
