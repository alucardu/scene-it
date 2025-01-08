import { inject, Injectable, signal } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../shared/types/user.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private auth = getAuth();
  readonly currentUser = signal<User | null>(null)

  createUserWithEmailAndPassword(signUpForm: FormGroup): void {
    createUserWithEmailAndPassword(
      this.auth,
      signUpForm.controls['email'].value,
      signUpForm.controls['password'].value
    ).then((userCredential) => {
      this.createUserDocument(userCredential, signUpForm);
    });
  }

  private async createUserDocument(userCredential: UserCredential, signUpForm: FormGroup): Promise<void> {
    const user = userCredential.user;
    const query = {
      createdAt: new Date().toISOString(),
      email: user.email,
      uid: user.uid,
      username: signUpForm.controls['username'].value,
      role: 'user',
    }

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userDocRef, query).then(() => this.router.navigate(['/dashboard']));
  }

  signInWithEmailAndPassword (signInForm: FormGroup): void {
    signInWithEmailAndPassword(this.auth, signInForm.controls['email'].value, signInForm.controls['password'].value).then(() => {
      this.router.navigate(['/dashboard']);
    })
  }

  async initializeAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
            this.currentUser.set(userDoc.data() as User);
          } catch (error) {
            console.error('Error fetching user data:', error);
            reject(error);
          }
        } else {
          this.currentUser.set(null);
        }
        resolve();
      });
    });
  }

  signOut(): void {
    signOut(this.auth).then(() => {
      this.router.navigate(['/auth/sign-in']);
      location.reload();
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }
}
