import { TestBed } from '@angular/core/testing';

import { SysMsgMgmtService } from './sysmsgs-mgmt.service';

describe('SysmsgMgmtService', () => {
  let service: SysMsgMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SysMsgMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
