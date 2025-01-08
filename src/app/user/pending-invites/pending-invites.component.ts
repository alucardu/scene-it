import { Component, inject } from '@angular/core';
import { UserService } from '../user.service';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../session/session.service';

@Component({
  selector: 'app-pending-invites',
  templateUrl: './pending-invites.component.html',
  styleUrls: ['./pending-invites.component.css'],
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatButton, RouterLink]
})
export class PendingInvitesComponent {
  private userService = inject(UserService);
  sessionService = inject(SessionService);

  currentUserPendingInvitesResource = this.userService.currentUserPendingInvitesResource;

  acceptInvite(uid: string): void {
    this.userService.acceptedInvite.set(uid);
    this.currentUserPendingInvitesResource.reload();
    this.sessionService.sessionsResource.reload();
  }

  declineInvite(uid: string): void {
    this.userService.declinedInvite.set(uid);
    this.currentUserPendingInvitesResource.reload();
    this.sessionService.sessionsResource.reload();
  }
}
