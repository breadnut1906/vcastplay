import { Routes } from "@angular/router";
import { environment } from "../../../environments/environment.development";

const appTitle: string = environment.appTitle;

export default [
    {
        path: 'screen-registration', 
        loadComponent: () => import('./screen-list/screen-list.component').then(m => m.ScreenListComponent),
        title: `Screen Registration • ${appTitle}`,
    },
    {
        path: 'screen-details', 
        loadComponent: () => import('./screen-details/screen-details.component').then(m => m.ScreenDetailsComponent),
        title: `Screen Details • ${appTitle}`,
    },
] as Routes