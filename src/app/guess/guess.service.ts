import { inject, Injectable, resource, signal } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Movie } from '../shared/types/movie.types';
import { SessionService } from '../session/session.service';
import { Session } from '../shared/types/session.types';
import { Guess } from '../shared/types/guess.types';
import { nanoid } from 'nanoid';

@Injectable({
  providedIn: 'root'
})
export class GuessService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService)

  createGuess(movie: Movie, session: Session): void {
    const guessId = nanoid();
    const guess:
    Guess = {
      uid: this.authService.currentUser()?.uid!,
      session_id: session.uid!,
      movie_id: movie.id,
      title: movie.title,
      createdAt: new Date().toISOString(),
      username: this.authService.currentUser()?.username!,
      users: session.users.length,
      guess_id: guessId,
    }

    const guessCollectionRef = collection(this.firestore, 'guesses');
    setDoc(doc(guessCollectionRef), guess);

    this.currentGuessLoading.set(true)
    setTimeout(() => {
      this.currentGuessResource.reload();
      this.sessionService.sessionResource.reload();
      this.currentGuessLoading.set(false);
    }, 2500)
  }

  allGuessesResource = resource({
    request: () => this.sessionService.getCurrentSessionId(),
    loader: async ({request}) => {
      const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'guesses'), where('session_id', '==', request)))
      return sessionDocsSnap.docs.map((doc) => doc.data());
    }
  })

  currentGuessLoading = signal(false);
  currentGuessResource = resource({
    loader: async () => {
      const sessionDoc = doc(this.firestore, `sessions/${this.sessionService.getCurrentSessionId()!}`);
      return getDoc(sessionDoc).then((snapshot) => {
        if (snapshot.exists()) {
          const session = snapshot.data() as Session;
          return session.current_round.find(
            (guess) => guess.user_id === this.authService.currentUser()?.uid
          );
        }
        return undefined; // Document doesn't exist
      });
    }
  })
}
