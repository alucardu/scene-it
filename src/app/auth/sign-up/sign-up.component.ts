import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  getAuth,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, RouterModule],
})
export class SignUpComponent  {
  private fb = inject(FormBuilder);
  private auth = getAuth();

  signUpForm: FormGroup;

  constructor() {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(12)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), this.passwordMatchValidator]]
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.parent?.get('confirmPassword')?.value;

    return password !== confirmPassword ? { passwordMismatch: true } : null
  };

  onSubmit(): void {
    if (this.signUpForm.invalid) return;

    createUserWithEmailAndPassword(
      this.auth,
      this.signUpForm.controls['email'].value,
      this.signUpForm.controls['password'].value
    );
  }
}
