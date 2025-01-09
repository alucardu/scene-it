/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GuessService } from './guess.service';

describe('Service: Guess', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuessService]
    });
  });

  it('should ...', inject([GuessService], (service: GuessService) => {
    expect(service).toBeTruthy();
  }));
});
