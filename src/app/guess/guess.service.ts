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

  currentGuessResource = resource({
    loader: async () => {
      const guessesRef = collection(this.firestore, 'guesses');
      const guess_ids = this.sessionService.sessionResource.value()?.current_round?.guess_ids
      const q = query(guessesRef, where('guess_id', 'in', guess_ids));
      const querySnapshot = await getDocs(q);

      if(querySnapshot.empty) return null;

      return querySnapshot.docs[0].data().uid === this.authService.currentUser()!.uid ? querySnapshot.docs[0].data() as Guess : null;
    }
  });

  allGuessesResource = resource({
    request: () => this.sessionService.getCurrentSessionId(),
    loader: async ({request}) => {
      const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'guesses'), where('session_id', '==', request)))
      return sessionDocsSnap.docs.map((doc) => doc.data());
    }
  })
}
