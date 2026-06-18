import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'list',
    loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'add-item',
    loadComponent: () => import('./features/add-item/add-item.component').then(m => m.AddItemComponent),
    canActivate: [authGuard],
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product/product.component').then(m => m.ProductComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'list',
  },
];
