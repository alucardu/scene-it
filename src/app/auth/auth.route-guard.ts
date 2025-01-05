import { inject, Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router = inject(Router)
  private auth = getAuth();

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(this.router.createUrlTree(['/dashboard']));
        } else {
          resolve(true);
        }
      });
    });
  }
}
