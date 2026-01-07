import { Routes } from "@angular/router";
import { environment } from "../../environments/environment.development";

const appTitle: string = environment.appTitle;
export default [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: `Dashboard • ${appTitle}`,
    },
    { 
        path: 'screens', 
        loadChildren: () => import('./screens/screens.routes') 
    },
    { 
        path: 'assets', 
        loadChildren: () => import('./assets/assets.routes') 
    },
    { 
        path: 'playlist', 
        loadChildren: () => import('./playlist/playlist.routes') 
    },
    {
        path: 'layout',
        loadChildren: () => import('./design-layout/design-layout.route'),
    },
    { 
        path: 'schedule', loadChildren: () => import('./schedules/schedules.route') 
    },
    {
        path: 'screen-management',
        loadComponent: () => import('./screen-management/screen-management-list/screen-management-list.component').then((m) => m.ScreenManagementListComponent),
        title: `Screen Management • ${appTitle}`,
    },
    {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then((m) => m.ReportsComponent),
        title: `Reports • ${appTitle}`,
    },
    { 
        path: 'settings', loadChildren: () => import('./settings/settings.routes') 
    },
    {
        path: '**', 
        redirectTo: 'dashboard'
    }
] as Routes