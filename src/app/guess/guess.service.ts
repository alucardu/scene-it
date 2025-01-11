import { inject, Injectable, resource } from '@angular/core';
import { collection, doc, Firestore, getDocs, query, setDoc, where } from '@angular/fire/firestore';
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
    setDoc(doc(guessCollectionRef), guess).then(() => this.allGuessesResource.reload())
  }

  allGuessesResource = resource({
    request: () => this.sessionService.getCurrentSessionId(),
    loader: async ({request}) => {
      const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'guesses'), where('session_id', '==', request)))
      return sessionDocsSnap.docs.map((doc) => doc.data());
    }
  })
}
