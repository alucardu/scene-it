import { Routes } from '@angular/router';
import { DashboardGuard } from './dashboard/dashboard.route-guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [DashboardGuard]
  },
];
