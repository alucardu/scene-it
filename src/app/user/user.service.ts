import { inject, Injectable, resource, signal } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { User } from '../shared/types/user.types';
import { AuthService } from '../auth/auth.service';

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

}
