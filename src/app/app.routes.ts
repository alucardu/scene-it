import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.route-guard';
import { DashboardGuard } from './dashboard/dashboard/dashboard.route-guard';

export const routes: Routes = [
  {
    path: 'auth/sign-in',
    loadComponent: () => import('./auth/sign-in/sign-in.component').then(m => m.SignInComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth/sign-up',
    loadComponent: () => import('./auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [DashboardGuard]
  },
  {
    path: '*',
    redirectTo: 'auth/sign-in',
    pathMatch: 'full',
  },
];
