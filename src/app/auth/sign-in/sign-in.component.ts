import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, RouterModule],
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = getAuth();

  signInForm: FormGroup;

  constructor() {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    console.log(1)
    if (this.signInForm.invalid) return;

    // Sign in with email and password
    signInWithEmailAndPassword(this.auth, this.signInForm.controls['email'].value, this.signInForm.controls['password'].value).then(() => {
      this.router.navigate(['/dashboard']);
    })
  }
}
