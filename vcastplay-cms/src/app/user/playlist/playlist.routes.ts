import { Routes } from "@angular/router";
import { environment } from "../../../environments/environment.development";
import { canDeactivateGuard } from "../../core/guards/can-deactivate.guard";

const appTitle: string = environment.appTitle;

export default [
    {
        path: 'playlist-library', 
        loadComponent: () => import('./playlist-list/playlist-list.component').then(m => m.PlaylistListComponent),
        title: `Playlists • ${appTitle}`,
    },
    {
        path: 'playlist-details', 
        loadComponent: () => import('./playlist-details/playlist-details.component').then(m => m.PlaylistDetailsComponent),
        title: `Playlist Details • ${appTitle}`,
        canDeactivate: [ canDeactivateGuard ]
    },
] as Routes