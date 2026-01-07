
import { Routes } from "@angular/router";
import { environment } from "../../environments/environment.development";

const appTitle: string = environment.appTitle;
export default [
    {
        path: 'summary',
        loadComponent: () =>
            import('./dashboard/analytics/analytics.component').then((m) => m.AnalyticsComponent),
        title: `Analytics • ${appTitle}`,
    },
    {
        path: 'screens',
        loadComponent: () =>
            import('./screens/screens.component').then((m) => m.ScreensComponent),
        title: `Screen Management • ${appTitle}`,
    },
    {
        path: '**',
        redirectTo: 'summary',
    }
] as Routes