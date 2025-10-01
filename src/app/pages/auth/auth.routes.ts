import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register.page').then(m => m.RegisterPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];