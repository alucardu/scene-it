import { EnvironmentInjector, inject, Injectable, resource, runInInjectionContext, signal } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Match } from '../shared/types/match.types';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private environmentInjector = inject(EnvironmentInjector)
  private firestore = inject(Firestore);

  guessId = signal<string | null>(null);

  createMatchResource(guessId: string) {
    return runInInjectionContext(this.environmentInjector, () =>
      resource({
        request: () => guessId,
        loader: async ({ request }) => {
          const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'matches'), where('guess_id', '==', request)));
          return sessionDocsSnap.docs[0].data().matches as Match;
        },
      })
    );
  }
}
