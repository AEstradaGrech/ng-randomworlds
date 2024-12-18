import { TestBed } from '@angular/core/testing';

import { ChatPromptsMgmtService } from './chat-prompts-mgmt.service';

describe('ChatPromptsMgmtService', () => {
  let service: ChatPromptsMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatPromptsMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
