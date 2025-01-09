import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../session/session.service';
import { SessionInvitesService } from '../../shared/services/session-invites.service';

@Component({
  selector: 'app-pending-invites',
  templateUrl: './pending-invites.component.html',
  styleUrls: ['./pending-invites.component.css'],
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatButton, RouterLink]
})
export class PendingInvitesComponent {
  sessionService = inject(SessionService)
  sessionInvitesService = inject(SessionInvitesService);

  currentUserPendingInvitesResource = this.sessionInvitesService.currentUserPendingInvitesResource;

  acceptInvite(uid: string): void {
    this.sessionInvitesService.acceptedInvite.set(uid);
    this.currentUserPendingInvitesResource.reload();
  }

  declineInvite(uid: string): void {
    this.sessionInvitesService.declinedInvite.set(uid);
    this.currentUserPendingInvitesResource.reload();
    this.sessionService.sessionsResource.reload();
  }
}
