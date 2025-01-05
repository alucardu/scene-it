import { Injectable, resource } from '@angular/core';
import { firestoreUrl } from '../../../env/dev.env';
import { getAuth } from 'firebase/auth';
import { mapFirestoreFields } from '../util/utils';
import { User } from '../types/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = getAuth();
  private currentUser = this.auth.currentUser;

  userResource = resource<User, unknown>({
    loader: async () => {
      const response = await fetch(firestoreUrl + `users/${this.currentUser?.uid}`);
      const data = await response.json();
      return mapFirestoreFields(data.fields);
    }
  })
}
