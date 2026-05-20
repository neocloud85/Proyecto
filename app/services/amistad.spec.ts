import { TestBed } from '@angular/core/testing';

import { Amistad } from './amistad';

describe('Amistad', () => {
  let service: Amistad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Amistad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
