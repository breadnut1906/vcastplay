import { Routes } from '@angular/router'
import { authGuard, authGuardChild } from './core/guards/auth.guard'

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes')
  },
  {
    path: 'admin',
    data: { roles: ['ADMIN'] },
    canActivate: [ authGuard ],
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    loadChildren: () => import('./admin/admin.routes')
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/main/main.component').then((m) => m.MainComponent),
    canActivate: [ authGuard ],
    canActivateChild: [ authGuardChild ],
    loadChildren: () => import('./user/user.routes')
  },
  { 
    path: 'upgrade', 
    loadChildren: () => import('./upgrade/upgrade.routes'), 
  },
  { 
    path: '**', 
    redirectTo: 'auth/login' 
  },
]
