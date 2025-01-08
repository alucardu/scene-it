import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { SessionListComponent } from '../../session/session-list/session-list.component';
import { PendingInvitesComponent } from '../../user/pending-invites/pending-invites.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SessionListComponent, PendingInvitesComponent]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  signOut(): void {
    this.authService.signOut();
  }
}
