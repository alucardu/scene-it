import { Component, inject } from '@angular/core';
import { MovieListComponent } from '../../movie/movie-list/movie-list.component';
import { GuessService } from '../guess.service';
import { SessionService } from '../../session/session.service';
import { Movie } from '../../shared/types/movie.types';
import { MovieService } from '../../movie/movie.service';

@Component({
  selector: 'app-guess',
  templateUrl: './guess.component.html',
  styleUrls: ['./guess.component.css'],
  imports: [MovieListComponent]
})
export class GuessComponent {
  private guessService = inject(GuessService)
  private sessionService = inject(SessionService)
  private movieService = inject(MovieService);

  createGuess(movie: Movie): void {
    this.guessService.createGuess(movie, this.sessionService.getCurrentSession()!);
  }
}