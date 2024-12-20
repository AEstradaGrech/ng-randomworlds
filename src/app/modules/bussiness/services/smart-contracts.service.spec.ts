import { TestBed } from '@angular/core/testing';

import { SmartContractsService } from './smart-contracts.service';

describe('SmartContractsService', () => {
  let service: SmartContractsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartContractsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
