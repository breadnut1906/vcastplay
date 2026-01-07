import { Routes } from "@angular/router";
import { environment } from "../../../environments/environment.development";
import { canDeactivateGuard } from "../../core/guards/can-deactivate.guard";

const appTitle: string = environment.appTitle;

export default [
    {
        path: 'schedule-library', 
        loadComponent: () => import('./schedule-list/schedule-list.component').then(m => m.ScheduleListComponent),
        title: `Schedules • ${appTitle}`,
    },
    {
        path: 'schedule-details', 
        loadComponent: () => import('./schedule-details/schedule-details.component').then(m => m.ScheduleDetailsComponent),
        title: `Schedule Details • ${appTitle}`,
        canDeactivate: [ canDeactivateGuard ]
    },
] as Routes