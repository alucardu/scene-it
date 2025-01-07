import { Component, inject } from '@angular/core';
import { SessionService } from '../session.service';
import { NewSessionComponent } from '../new-session/new-session.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css'],
  imports: [NewSessionComponent, MatCardModule, MatInputModule, MatButtonModule, RouterLink]
})

export class SessionListComponent {
  private sessionService = inject(SessionService);
  private userService = inject(UserService);

  sessions = this.sessionService.sessionsResource;
  user = this.userService.userResource;

  deleteSession(uid: string): void {
    this.sessionService.deleteSesion(uid);
  }
}