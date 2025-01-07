import { inject, Injectable, resource } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { User } from '../types/user.types';
import { collection, doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore)
  private currentUser = getAuth().currentUser;

  userResource = resource({
    loader: async () => {
      return (await getDoc(doc(collection(this.firestore, 'users'), this.currentUser?.uid))).data() as User;
    }
  });
}
