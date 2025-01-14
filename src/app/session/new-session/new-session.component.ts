import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SessionService } from '../session.service';
import { MovieService } from '../../movie/movie.service';
import { AuthService } from '../../auth/auth.service';
import { UserListComponent } from '../../user/user-list/user-list.component';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css'],
  imports: [MatCardModule, MatInputModule, MatButtonModule, UserListComponent]
})
export class NewSessionComponent {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private movieService = inject(MovieService)
  private userService = inject(UserService);

  sessions = this.sessionService.sessionsResource;
  user = this.authService.currentUser;

  createNewSession(): void {
    const usersInSession = this.userService.allUsersInvitedToSession().map((user) => user.uid);
    this.sessionService.createNewSession.set({
      users: [this.user()!.uid],
      movie_title: '',
      tmdb_id: '',
      pending_invites: [...usersInSession],
      host_id: this.user()!.uid,
      rounds: [],
      current_round: [],
      status: "waiting",
      winners: null,
      hints: []
    });
  }
}
