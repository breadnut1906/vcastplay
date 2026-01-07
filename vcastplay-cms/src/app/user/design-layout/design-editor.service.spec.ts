import { TestBed } from '@angular/core/testing';

import { DesignEditorService } from './design-editor.service';

describe('DesignEditorService', () => {
  let service: DesignEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesignEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
