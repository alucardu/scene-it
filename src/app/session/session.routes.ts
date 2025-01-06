import { Routes } from '@angular/router';

export const SESSION_ROUTES: Routes = [
  {
    path: 'new-session',
    loadComponent: () => import('./new-session/new-session.component').then(m => m.NewSessionComponent),
  },
  {
    path: ':uid',
    loadComponent: () => import('./session/session.component').then(m => m.SessionComponent),
  }
];
