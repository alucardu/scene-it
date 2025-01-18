import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SessionService } from '../session.service';
import { MovieService } from '../../movie/movie.service';
import { AuthService } from '../../auth/auth.service';
import { UserListComponent } from '../../user/user-list/user-list.component';
import { UserService } from '../../user/user.service';
import { SessionConfigComponent } from './session-config/session-config.component';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css'],
  imports: [MatCardModule, MatInputModule, MatButtonModule, UserListComponent, SessionConfigComponent]
})
export class NewSessionComponent {
  @ViewChild(SessionConfigComponent) sessionConfigComponent!: SessionConfigComponent;

  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private movieService = inject(MovieService)
  private userService = inject(UserService);

  sessions = this.sessionService.sessionsResource;
  user = this.authService.currentUser;
  error = signal(false);

  userSelected(): void {
    this.error.set(false)
  }

  newSession(): void {
    if (this.sessionConfigComponent.sessionConfigForm.invalid) return

    const usersInSession = this.userService.allUsersInvitedToSession().map((user) => {
      return {
        uid: user.uid,
        username: user.username
      }
    });

    if(usersInSession.length === 0) {
      this.error.set(true);
      return;
    }

    // first get random movie
    this.movieService.sessionConfig.set(this.sessionConfigComponent.sessionConfigForm.value)

    this.sessionService.createNewSession.set({
      users: [{
        uid: this.user()!.uid,
        username: this.user()?.username
      }],
      movie_title: '',
      tmdb_id: '',
      pending_invites: [...usersInSession],
      host_id: this.user()!.uid,
      host_name: this.user()!.username,
      rounds: [],
      current_round: [],
      status: "waiting",
      winners: null,
      current_hint: null,
      config: this.sessionConfigComponent.sessionConfigForm.value,
    });
  }
}
