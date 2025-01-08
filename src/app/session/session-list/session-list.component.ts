import { Component, inject } from '@angular/core';
import { SessionService } from '../session.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css'],
  imports: [MatCardModule, MatInputModule, MatButtonModule, RouterLink]
})

export class SessionListComponent {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  user = this.authService.currentUser;

  sessions = this.sessionService.sessionsResource;
  currentUserPendingInvitesResource = this.userService.currentUserPendingInvitesResource;

  deleteSession(uid: string): void {
    this.sessionService.deleteSesion(uid);
  }
}
