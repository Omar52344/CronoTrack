import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

export const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: 'activities',
        loadComponent: () => import('../activities/activities.page').then(m => m.ActivitiesPage)
      },
      {
        path: 'projects',
        loadComponent: () => import('../projects/projects.page').then(m => m.ProjectsPage)
      },
      {
        path: 'reports',
        loadComponent: () => import('../reports/reports.page').then(m => m.ReportsPage)
      },
      {
        path: '',
        redirectTo: 'activities',
        pathMatch: 'full'
      }
    ]
  }
];