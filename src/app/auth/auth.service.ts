import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firestoreUrl } from '../../env/dev.env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
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

  private createUserDocument(userCredential: UserCredential, signUpForm: FormGroup): void {
    const user = userCredential.user;
      this.http.post(firestoreUrl + `users?documentId=${user.uid}`, {
        fields: {
          email: { stringValue: user.email },
          username: { stringValue: signUpForm.controls['username'].value },
          createdAt: { timestampValue:  new Date().toISOString() },
        }
      }).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
  }

  signInWithEmailAndPassword (signInForm: FormGroup): void {
    signInWithEmailAndPassword(this.auth, signInForm.controls['email'].value, signInForm.controls['password'].value).then(() => {
      this.router.navigate(['/dashboard']);
    })
  }

  signOut(): void {
    signOut(this.auth).then(() => {
      this.router.navigate(['/auth/sign-in']);
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }
}
