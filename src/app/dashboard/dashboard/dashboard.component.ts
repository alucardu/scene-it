import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { SessionsComponent } from '../../session/sessions/sessions.component';
import { PendingInvitesComponent } from '../../user/pending-invites/pending-invites.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SessionsComponent, PendingInvitesComponent, MatButton]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  signOut(): void {
    this.authService.signOut();
  }
}
