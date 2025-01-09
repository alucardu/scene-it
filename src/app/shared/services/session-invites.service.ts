import { inject, Injectable, resource, signal } from '@angular/core';
import { SessionService } from '../../session/session.service';
import { AuthService } from '../../auth/auth.service';
import { arrayRemove, arrayUnion, collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Session } from '../types/session.types';

@Injectable({
  providedIn: 'root'
})
export class SessionInvitesService {
  private firestore = inject(Firestore);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  private user = this.authService.currentUser;


  acceptedInvite = signal<string | null>(null);
  addUserToSession = resource({
    request: () => this.acceptedInvite(),
    loader: async ({request}) => {
      if(!request) return;

      const sessionDocRef = doc(collection(this.firestore, 'sessions'), request)
      updateDoc(sessionDocRef, {
        users: arrayUnion(this.user()?.uid),
        pending_invites: arrayRemove(this.user()?.uid),
      }).then(() => this.sessionService.sessionsResource.reload());
    }
  });

  declinedInvite = signal<string | null>(null);
  removeUserFromInvites = resource({
    request: () => this.declinedInvite(),
    loader: async ({request}) => {
      if(!request) return;

      const sessionDocRef = doc(collection(this.firestore, 'sessions'), request)
      updateDoc(sessionDocRef, {
        pending_invites: arrayRemove(this.user()?.uid),
      });
    }
  });

  currentUserPendingInvitesResource = resource({
    loader: async () => {
      const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'sessions'), where('pending_invites', 'array-contains', this.user()!.uid)))
      return sessionDocsSnap.docs.map((doc) => doc.data()) as Session[];
    }
  });

}