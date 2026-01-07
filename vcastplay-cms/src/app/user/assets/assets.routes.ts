import { Routes } from "@angular/router";
import { environment } from "../../../environments/environment.development";
import { canDeactivateGuard } from "../../core/guards/can-deactivate.guard";

const appTitle: string = environment.appTitle;

export default [
    {
        path: 'asset-library', 
        loadComponent: () => import('./asset-list/asset-list.component').then(m => m.AssetListComponent),
        title: `Asset Library • ${appTitle}`,
    },
    {
        path: 'asset-details', 
        loadComponent: () => import('./asset-details/asset-details.component').then(m => m.AssetDetailsComponent),
        title: `Asset Upload • ${appTitle}`,
        canDeactivate: [ canDeactivateGuard ]
    },
] as Routes