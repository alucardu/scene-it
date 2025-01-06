import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SessionService } from '../session.service';
import { UserService } from '../../shared/service/user.service';
import { MoviesService } from '../../movies/movies.service';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css'],
  imports: [MatCardModule, MatInputModule, MatButtonModule]
})
export class NewSessionComponent {
  private sessionService = inject(SessionService);
  private userService = inject(UserService);
  private movieService = inject(MoviesService)

  sessions = this.sessionService.sessionsResource;
  user = this.userService.userResource;

  createNewSession(): void {
    this.sessionService.createNewSession.set({users: [this.user.value()!.uid]});
  }
}
