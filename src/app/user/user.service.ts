import { inject, Injectable, resource, signal } from '@angular/core';
import { arrayRemove, arrayUnion, collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../shared/types/user.types';
import { AuthService } from '../auth/auth.service';
import { Session } from '../shared/types/session.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private user = this.authService.currentUser;

  allUsersInvitedToSession = signal<User[]>([]);
  inviteUserToSession(user: User): void {
    this.allUsersInvitedToSession.update((users) => [...users, user]);
  };

  usernameQuery = signal('');
  userListResource = resource({
    request: () => this.usernameQuery(),
    loader: async ({request}) => {
      if(!(request.length >= 3)) return null;

      const usersQuery = query(collection(this.firestore, 'users'), where('username', '>=', request), where('username', '<', request + '\uf8ff'));
      const userDocsSnap = await getDocs(usersQuery);
      return userDocsSnap.docs
        .filter((doc) => doc.data().uid !== this.user()!.uid)
        .map((doc) => ({...doc.data() })) as User[];
    }
  });

  currentUserPendingInvitesResource = resource({
    loader: async () => {
      const sessionDocsSnap = await getDocs(query(collection(this.firestore, 'sessions'), where('pending_invites', 'array-contains', this.user()!.uid)))
      return sessionDocsSnap.docs.map((doc) => doc.data()) as Session[];
    }
  });

  acceptedInvite = signal<string | null>(null);
  addUserToSession = resource({
    request: () => this.acceptedInvite(),
    loader: async ({request}) => {
      if(!request) return;

      const sessionDocRef = doc(collection(this.firestore, 'sessions'), request)
      updateDoc(sessionDocRef, {
        users: arrayUnion(this.user()?.uid),
        pending_invites: arrayRemove(this.user()?.uid),
      });
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

}
