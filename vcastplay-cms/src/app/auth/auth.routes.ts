import { Routes } from "@angular/router";
import { environment } from "../../environments/environment.development";

const appTitle: string = environment.appTitle;

export default [
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        title: `Login • ${appTitle}`,
    },
] as Routes