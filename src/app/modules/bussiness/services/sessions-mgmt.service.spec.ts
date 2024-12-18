import { TestBed } from '@angular/core/testing';

import { SessionsMgmtService } from './sessions-mgmt.service';

describe('SessionsMgmtService', () => {
  let service: SessionsMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionsMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
