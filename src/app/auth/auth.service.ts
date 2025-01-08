import { inject, Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firestoreUrl } from '../../env/dev.env';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private auth = getAuth();

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
