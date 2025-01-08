import { inject, Injectable, resource } from '@angular/core';
import { SessionService } from '../session/session.service';
import { fireFunctionUrl } from '../../env/dev.env';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private sessionService = inject(SessionService);

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
