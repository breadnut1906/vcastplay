import { Routes } from '@angular/router'
import { environment } from '../environments/environment.development'
import { authGuard, authGuardChild } from './core/guards/auth.guard'

const appTitle: string = environment.appTitle
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: `Login • ${appTitle}`,
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-main/admin-main.component').then((m) => m.AdminMainComponent),
    children: [
      {
        path: 'summary',
        loadComponent: () =>
          import('./admin/dashboard/analytics/analytics.component').then((m) => m.AnalyticsComponent),
        title: `Analytics • ${appTitle}`,
      },
      { path: 'screens', loadChildren: () => import('./features/screens/screens.routes') },
      {
          path: 'user-management', 
          loadComponent: () => import('./features/settings/users/user-list/users.component').then(m => m.UsersComponent),
          title: `User Management • ${appTitle}`,
      },
    ]
  },
  {
    path: '',
    loadComponent: () => import('./main/main.component').then((m) => m.MainComponent),
    canActivate: [ authGuard ],
    canActivateChild: [ authGuardChild ],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: `Dashboard • ${appTitle}`,
      },
      { path: 'screens', loadChildren: () => import('./features/screens/screens.routes') },
      { path: 'assets', loadChildren: () => import('./features/assets/assets.routes') },
      { path: 'playlist', loadChildren: () => import('./features/playlist/playlist.routes') },
      {
        path: 'layout',
        loadChildren: () => import('./features/design-layout/design-layout.route'),
      },
      { path: 'schedule', loadChildren: () => import('./features/schedules/schedules.route') },
      {
        path: 'screen-management',
        loadComponent: () =>
          import(
            './features/screen-management/screen-management-list/screen-management-list.component'
          ).then((m) => m.ScreenManagementListComponent),
        title: `Screen Management • ${appTitle}`,
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
        title: `Reports • ${appTitle}`,
      },
      { path: 'settings', loadChildren: () => import('./features/settings/settings.routes') },
    ],
  },
  { path: 'upgrade', loadChildren: () => import('./features/upgrade/upgrade.routes'), },
  { path: '**', redirectTo: 'dashboard' },
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
]
