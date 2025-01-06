import { Injectable, resource, signal } from '@angular/core';
import { firestoreUrl } from '../../env/dev.env';
import { extractAndFlattenFields } from '../shared/util/utils';
import { Session } from '../shared/types/session.types';
import { nanoid } from 'nanoid';
import { User } from '../shared/types/user.types';
import { Movie } from '../shared/types/movie.types';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionUid = signal<string | null>(null);

  sessionsResource = resource({
    loader: async () => {
      const response = await fetch(firestoreUrl + `/sessions`);
      const data = await response.json();
      return extractAndFlattenFields(data.documents) as Session[];
    }
  });

  getCurrentSession = signal<string | null>(null)
  sessionResource = resource({
    request: () => this.getCurrentSession(),
    loader: async ({request}) => {
      if(!request) return null;

      const response = await fetch(firestoreUrl + `/sessions/${request}`);
      const data = await response.json();
      const session = extractAndFlattenFields(data) as Session
      return session;
    }
  });

  // Uses the sessionResource to request players
  sessionUsersResource = resource({
    request: () => this.sessionResource.value()?.users,
    loader: async ({request}) => {
      const query = { structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: { fieldFilter: {field: { fieldPath: 'uid' }, op: 'IN', value: { arrayValue: { values: request?.map(uid => ({ stringValue: uid }))}}}}
      }};

      const response = await fetch(`${firestoreUrl}:runQuery`, {
        method: 'POST',
        body: JSON.stringify(query),
      });

      const data = await response.json();
      const users = data.map((doc: any) => doc.document)
      return extractAndFlattenFields(users) as User[]
    }
  });

  createNewSession = signal<Session | null>(null);
  newSessionResource = resource({
    request: () => this.createNewSession(),
    loader: async ({request}) => {
      if(request) {
        this.sessionUid.set(nanoid());

        const query = {
          fields: {
            uid: { stringValue: this.sessionUid() },
            users: { arrayValue: { values: [ { stringValue: request.users[0] }]}},
            movie_title: { stringValue: 'asd' },
          }
        };

        const response = await fetch(`${firestoreUrl}/sessions/${this.sessionUid()}`, {
          method: 'PATCH',
          body: JSON.stringify(query)
        });

        this.sessionsResource.reload();
        return await response.json();
      }
      return null;
    }
  });

  randomMovie = signal<Movie | null>(null);
  addMovieToSessionResource = resource({
    request: () => this.randomMovie(),
    loader: async ({request}) => {
      if(request) {
        const query = {
          fields: {
            movie_title: { stringValue: request.title }
          }
        }
        await fetch(`${firestoreUrl}/sessions/${this.sessionUid()}/?updateMask.fieldPaths=movie_title`, {
          method: 'PATCH',
          body: JSON.stringify(query)
        });
      }
    }
  })
}
