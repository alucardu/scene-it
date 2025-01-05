import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: []
})
export class DashboardComponent {
  private router = inject(Router);
  private auth = getAuth();

  signOut(): void {
    signOut(this.auth).then(() => {
      this.router.navigate(['/auth/sign-in']);
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }
}
