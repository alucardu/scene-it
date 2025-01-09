import { inject, Injectable, resource, signal } from '@angular/core';
import { SessionService } from '../session/session.service';
import { fireFunctionUrl } from '../../env/dev.env';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private sessionService = inject(SessionService);

  movieTitleQuery = signal('');
  moviesResrouce = resource({
    request: () => this.movieTitleQuery(),
    loader: async ({request}) => {
      if(request.length > 2) {
        const response = await fetch(`${fireFunctionUrl}/getSearchedMovies`, {
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
        const args = {
          release_date_start: '2000-01-01',
          release_date_end: '2024-01-01',
        }

        const response = await fetch(`${fireFunctionUrl}/getRandomMovie`, {
          method: 'POST',
          body: JSON.stringify(args),
        });

        const randomMovie = await response.json();
        this.sessionService.randomMovie.set(randomMovie.movie);
      }
    }
  });
}
