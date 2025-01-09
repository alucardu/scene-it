/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SessionInvitesService } from './session-invites.service';

describe('Service: SessionInvites', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionInvitesService]
    });
  });

  it('should ...', inject([SessionInvitesService], (service: SessionInvitesService) => {
    expect(service).toBeTruthy();
  }));
});
