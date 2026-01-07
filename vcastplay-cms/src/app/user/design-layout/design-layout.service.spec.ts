import { TestBed } from '@angular/core/testing';

import { DesignLayoutService } from './design-layout.service';

describe('DesignLayoutService', () => {
  let service: DesignLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesignLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
