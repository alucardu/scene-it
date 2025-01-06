import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './auth/auth.routes';
import { SESSION_ROUTES } from './session/session.routes';
import { DASHBOARD_ROUTES } from './dashboard/dashboard.routes';

export const routes: Routes = [
  { path: 'auth', children: AUTH_ROUTES },
  { path: 'dashboard', children: DASHBOARD_ROUTES },
  { path: 'session', children: SESSION_ROUTES },
  {
    path: '*',
    redirectTo: 'auth/sign-in',
    pathMatch: 'full',
  },
];
