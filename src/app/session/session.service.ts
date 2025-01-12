import { effect, inject, Injectable, resource, signal } from '@angular/core';
import { Session } from '../shared/types/session.types';
import { nanoid } from 'nanoid';
import { Movie } from '../shared/types/movie.types';
import { rxResource } from '@angular/core/rxjs-interop';
import { collection, deleteDoc, doc, docData, Firestore, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { User } from '../shared/types/user.types';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private firestore = inject(Firestore)
  private sessionUid = signal<string | null>(null);
  private sessionCreated = signal(false);

  constructor() {
    effect(() => {
      if(this.sessionCreated()) {
        this.router.navigate([`session/${this.sessionUid()}`]);
        this.sessionCreated.set(false);
      }
    })
  }

  sessionsResource = resource({
    loader: async () => {
      const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'sessions'), where('users', 'array-contains', this.authService.currentUser()?.uid)))
      return sessionDocsSnap.docs.map((doc) => doc.data());
    }
  });

  getCurrentSessionId = signal<string | null>(null)
  sessionResource = rxResource({
    request: () => this.getCurrentSessionId(),
    loader: ({request}) => {
      if(!request) return of(null);

      const session = doc(this.firestore, `sessions/${request}`);
      return docData(session) as Observable<Session>;
    }
  });

  sessionUsersResource = resource({
    request: () => this.sessionResource.value(),
    loader: async ({request}) => {
      const userDocsSnap = await getDocs(query(collection(this.firestore, 'users'), where('uid', 'in', request?.users)));

      return userDocsSnap.docs.map((doc) => ({
        ...doc.data(),
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
          tmdb_id: '',
          users: [request.users[0]],
          pending_invites: [...request.pending_invites],
          host_id: request.users[0],
          rounds: [],
          current_round: {
            guess_ids: [],
            user_ids: [],
          },
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
        updateDoc(sessionDocRef, {
          movie_title: request.title,
          tmdb_id: request.id
        }).then(() => this.sessionCreated.set(true));
      }
    }
  });

  async deleteSesion(uid: string): Promise<void> {
    const session = doc(this.firestore, `sessions/${uid}`);
    deleteDoc(session).then(() => this.sessionsResource.reload());

    const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'guesses'), where('session_id', '==', uid)))
    sessionDocsSnap.docs.map((doc) => deleteDoc(doc.ref));
  }
}
