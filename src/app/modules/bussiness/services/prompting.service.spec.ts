import { TestBed } from '@angular/core/testing';

import { PromptingService } from './prompting.service';

describe('PromptingService', () => {
  let service: PromptingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
