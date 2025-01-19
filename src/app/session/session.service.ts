import { effect, inject, Injectable, resource, signal } from '@angular/core';
import { Session } from '../shared/types/session.types';
import { nanoid } from 'nanoid';
import { Movie } from '../shared/types/movie.types';
import { collection, deleteDoc, doc, docData, Firestore, getDoc, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
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
      const sessionDocsSnap = await getDocs(
        query(
          collection(this.firestore, 'sessions'),
          where('users', 'array-contains', {
            uid: this.authService.currentUser()?.uid,
            username: this.authService.currentUser()?.username
          })
        )
      );
      return sessionDocsSnap.docs.map((doc) => doc.data());
    }
  });

  getCurrentSessionId = signal<string | null>(null)
  sessionResource = resource({
    request: () => this.getCurrentSessionId(),
    loader: async ({request}) => {
      if(!request) null;

      const session = doc(this.firestore, `sessions/${request}`);

      return getDoc(session).then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.data() as Session;
        }
        return undefined;
      });
    }
  });

  createNewSession = signal<Session | null>(null);
  newSessionResource = resource({
    request: () => this.randomMovie(),
    loader: async ({request}) => {
      if(this.createNewSession()) {
        this.sessionUid.set(nanoid());
        const query: Session = {
          ...this.createNewSession()!,
          pending_invites: [...this.createNewSession()!.pending_invites],
          uid: this.sessionUid()!,
        };

        const sessionCollectionRef = collection(this.firestore, 'sessions');
        return setDoc(doc(sessionCollectionRef, this.sessionUid()!), query).then(() => this.sessionsResource.reload());
      }
      return null;
    }
  });

  randomMovie = signal<Movie | null>(null);
  addMovieToSessionResource = resource({
    request: () => this.newSessionResource.value(),
    loader: async ({request}) => {
      if(request) {
        const sessionDocRef = doc(collection(this.firestore, 'sessions'), this.sessionUid()!)
        updateDoc(sessionDocRef, {
          movie_title: this.randomMovie()!.title,
          tmdb_id: this.randomMovie()!.id,
          poster_path: this.randomMovie()!.poster_path,
        }).then(() => this.sessionCreated.set(true));
      }
    }
  });

  async deleteSesion(uid: string): Promise<void> {
    const session = doc(this.firestore, `sessions/${uid}`);
    deleteDoc(session).then(() => this.sessionsResource.reload());

    const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'guesses'), where('session_id', '==', uid)))
    sessionDocsSnap.docs.map((doc) => deleteDoc(doc.ref));

    const matchesDocsSnap = await getDocs(query(collection(this.firestore, 'matches'), where('session_id', '==', uid)))
    matchesDocsSnap.docs.map((doc) => deleteDoc(doc.ref));
  }
}
