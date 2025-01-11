import { inject, Injectable, resource, signal } from '@angular/core';
import { SessionService } from '../session/session.service';
import { fireFunctionUrl } from '../../env/dev.env';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Movie } from '../shared/types/movie.types';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private sessionService = inject(SessionService);
  private functions = inject(Functions);

  movieTitleQuery = signal('');
  moviesResrouce = resource({
    request: () => this.movieTitleQuery(),
    loader: async ({request}) => {
      if(request.length > 2) {
        const response = await fetch(`${fireFunctionUrl}/movie-getSearchedMovies`, {
          method: 'POST',
          body: JSON.stringify(request),
        });

        const movies = await response.json();
        return movies.movies.results
      } else {
        this.movieTitleQuery.set('');
        return null;
      }
    }
  })

  movieGuessId = signal<string | null>(null);
  movieResource = resource({
    request: () => this.movieGuessId(),
    loader: async ({request}) => {
      if (!request) return null;
      const args = request

      const response = await fetch(`${fireFunctionUrl}/getMovieById`, {
        method: 'POST',
        body: JSON.stringify(args),
      });

      return await response.json();
    }
  })

  getRandomMovieResource = resource({
    request: () => this.sessionService.newSessionResource.value(),
    loader: async ({request}) => {
      if(request) {
        const data: any = (await httpsCallable(this.functions, 'movie-getRandomMovie')({
          release_date_start: '2000-01-01',
          release_date_end: '2024-01-01',
        })).data;

        const movie: Movie = data.movie
        this.sessionService.randomMovie.set(movie);
      }
    }
  });
}
