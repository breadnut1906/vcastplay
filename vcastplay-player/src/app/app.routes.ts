import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./main-display/main-display.component').then((m) => m.MainDisplayComponent),
        title: 'Vcastplayer',
    },
    { path: "**", redirectTo: '/' },
];
