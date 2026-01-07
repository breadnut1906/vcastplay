import { Routes } from "@angular/router";
import { environment } from "../../../environments/environment.development";

const appTitle: string = environment.appTitle;
export default [
    {
        path: 'user-management', 
        loadComponent: () => import('./users/user-list/users.component').then(m => m.UsersComponent),
        title: `User Management • ${appTitle}`,
    },
    {
        path: 'role-management', 
        loadComponent: () => import('./roles/role-list/roles.component').then(m => m.RolesComponent),
        title: `Role Management • ${appTitle}`,
    },
    {
        path: 'profile', 
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        title: `Profile • ${appTitle}`,
    },
    {
        path: 'group',
        loadComponent: () => import('./groups/groups.component').then(m => m.GroupsComponent),
        title: `Groups • ${appTitle}`,
    },
    {
        path: 'category',
        loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent),
        title: `Categories • ${appTitle}`,
    },
    {
        path: 'tag',
        loadComponent: () => import('./tags/tags.component').then(m => m.TagsComponent),
        title: `Tags • ${appTitle}`,
    },
    {
        path: 'broadcast',
        loadComponent: () => import('./broadcast/broadcast-list/broadcast-list.component').then(m => m.BroadcastListComponent),
        title: `Broadcast Messages • ${appTitle}`,
    }
] as Routes