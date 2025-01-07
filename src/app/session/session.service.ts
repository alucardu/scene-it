import { inject, Injectable, resource, signal } from '@angular/core';
import { Session } from '../shared/types/session.types';
import { nanoid } from 'nanoid';
import { Movie } from '../shared/types/movie.types';
import { rxResource } from '@angular/core/rxjs-interop';
import { collection, collectionData, deleteDoc, doc, docData, Firestore, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { User } from '../shared/types/user.types';
import { updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private firestore = inject(Firestore)
  private sessionUid = signal<string | null>(null);

  sessionsResource = rxResource({
    loader: () => {
      const sessions = collection(this.firestore, 'sessions');
      return collectionData(sessions) as Observable<Session[]>
    }
  });

  getCurrentSession = signal<string | null>(null)
  sessionResource = rxResource({
    request: () => this.getCurrentSession(),
    loader: ({request}) => {
      if(!request) return of(null);
      
      const session = doc(this.firestore, `sessions/${request}`);
      return docData(session) as Observable<Session>;
    }
  });

  // Uses the sessionResource to request players
  sessionUsersResource = resource({
    request: () => this.sessionResource.value(),
    loader: async ({request}) => {
      const userDocsSnap = await getDocs(query(collection(this.firestore, 'users'), where('uid', 'in', request?.users)));
      
      return userDocsSnap.docs.map((doc) => ({
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt.seconds * 1000).toString(),
      })) as User[];
    }
  });

  createNewSession = signal<Session | null>(null);
  newSessionResource = resource({
    request: () => this.createNewSession(),
    loader: async ({request}) => {
      if(request) {
        this.sessionUid.set(nanoid());
        const query: Session = {
          uid: this.sessionUid()!,
          movie_title: '',
          users: [request.users[0]]
        };

        const sessionCollectionRef = collection(this.firestore, 'sessions');
        return setDoc(doc(sessionCollectionRef, this.sessionUid()!), query).then(() => this.sessionsResource.reload());
      }
      return null;
    }
  });

  randomMovie = signal<Movie | null>(null);
  addMovieToSessionResource = resource({
    request: () => this.randomMovie(),
    loader: async ({request}) => {
      if(request) {
        const sessionDocRef = doc(collection(this.firestore, 'sessions'), this.sessionUid()!)
        await updateDoc(sessionDocRef, { movie_title: request.title });
      }
    }
  });

  async deleteSesion(uid: string): Promise<void> {
    const session = doc(this.firestore, `sessions/${uid}`);
    deleteDoc(session).then(() => this.sessionsResource.reload())
  }
}
