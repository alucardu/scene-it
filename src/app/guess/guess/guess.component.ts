import { Component, inject } from '@angular/core';
import { MovieListComponent } from '../../movie/movie-list/movie-list.component';
import { GuessService } from '../guess.service';
import { SessionService } from '../../session/session.service';
import { Movie } from '../../shared/types/movie.types';
import { MovieService } from '../../movie/movie.service';
import { AuthService } from '../../auth/auth.service';
import { HintComponent } from '../../hint/hint/hint.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@Component({
  selector: 'app-guess',
  templateUrl: './guess.component.html',
  styleUrls: ['./guess.component.css'],
  imports: [MovieListComponent, HintComponent, CommonModule, MatProgressSpinnerModule]
})
export class GuessComponent {
  private authService = inject(AuthService)
  private guessService = inject(GuessService)
  private sessionService = inject(SessionService)
  private movieService = inject(MovieService);

  currentGuessResource = this.guessService.currentGuessResource;
  currentGuessLoading = this.guessService.currentGuessLoading;

  createGuess(movie: Movie): void {
    this.guessService.createGuess(movie, this.sessionService.sessionResource.value()!);
  }
}
