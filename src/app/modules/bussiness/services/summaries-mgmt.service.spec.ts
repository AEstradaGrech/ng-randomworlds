import { TestBed } from '@angular/core/testing';

import { SummariesMgmtService } from './summaries-mgmt.service';

describe('SummariesMgmtService', () => {
  let service: SummariesMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SummariesMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
