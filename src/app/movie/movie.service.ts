import { inject, Injectable, resource, signal } from '@angular/core';
import { SessionService } from '../session/session.service';
import { fireFunctionUrl } from '../../env/dev.env';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Movie } from '../shared/types/movie.types';
import { SessionConfig } from '../shared/types/session.types';

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

  sessionConfig = signal<SessionConfig | null>(null);
  getRandomMovieResource = resource({
    request: () => this.sessionConfig(),
    loader: async ({request}) => {
      if(request) {
        const today = new Date();
        const day = today.getDate();
        const month = String(today.getMonth() + 1).padStart(2, '0');

        const release_date_start = request.release_date_start ? `${request.release_date_start}-01-01` : null;
        const release_date_end = request.release_date_end ? `${request.release_date_end}-${day}-${month}` : null;

        const data: any = (await httpsCallable(this.functions, 'movie-getRandomMovie')({
          release_date_start,
          release_date_end,
          genre: request.genre
        })).data;

        const movie: Movie = data.movie
        if (movie === null) {
          console.log('session could not be made')
          return;
        }

        this.sessionService.randomMovie.set(movie);
      }
    }
  });
}
