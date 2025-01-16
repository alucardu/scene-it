import { Component, inject, signal } from '@angular/core';
import { MovieListComponent } from '../../movie/movie-list/movie-list.component';
import { GuessService } from '../guess.service';
import { SessionService } from '../../session/session.service';
import { Movie } from '../../shared/types/movie.types';
import { MovieService } from '../../movie/movie.service';
import { AuthService } from '../../auth/auth.service';
import { HintComponent } from '../../hint/hint/hint.component';

@Component({
  selector: 'app-guess',
  templateUrl: './guess.component.html',
  styleUrls: ['./guess.component.css'],
  imports: [MovieListComponent, HintComponent]
})
export class GuessComponent {
  private authService = inject(AuthService)
  private guessService = inject(GuessService)
  private sessionService = inject(SessionService)
  private movieService = inject(MovieService);

  sessionResource = this.sessionService.sessionResource;
  currentGuess = signal<string | undefined>((this.sessionResource.value()?.current_round?.find((guess) => guess.user_id === this.authService.currentUser()?.uid)?.movie_title));

  createGuess(movie: Movie): void {
    this.guessService.createGuess(movie, this.sessionService.sessionResource.value()!);
  }
}
