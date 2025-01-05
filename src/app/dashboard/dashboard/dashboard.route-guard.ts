import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { getAuth, User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardGuard implements CanActivate {
  private router = inject(Router)
  private auth = getAuth();

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
          setTimeout(() => {
            this.router.navigate(['/auth/sign-in']);
          }, 500)
        }
      });
    });
  }
}
