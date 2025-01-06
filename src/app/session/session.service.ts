import { Injectable, resource, signal } from '@angular/core';
import { firestoreUrl } from '../../env/dev.env';
import { extractAndFlattenFields } from '../shared/util/utils';
import { Session } from '../shared/types/session.types';
import { nanoid } from 'nanoid';
import { User } from '../shared/types/user.types';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  sessionsResource = resource({
    loader: async () => {
      const response = await fetch(firestoreUrl + `sessions`);
      const data = await response.json();
      return extractAndFlattenFields(data.documents) as Session[];
    }
  });

  getCurrentSession = signal<string | null>(null)
  sessionResource = resource({
    request: () => this.getCurrentSession(),
    loader: async ({request}) => {
      if(!request) return null;

      const response = await fetch(firestoreUrl + `sessions/${request}`);
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
        const uid = nanoid();

        const query = {
          fields: {
            uid: { stringValue: uid },
            users: { arrayValue: { values: [ { stringValue: request.users[0] }]}}
          }
        }

        await fetch(`${firestoreUrl}sessions/${uid}`, {
          method: 'PATCH',
          body: JSON.stringify(query)
        });

        this.sessionsResource.reload();
      }
    }
  });
}
