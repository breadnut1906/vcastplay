import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  drawerVisible = signal<boolean>(false)

  roles: any[] = [
    { label: 'Administrator', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest' },
  ]

  constructor() { }

  getStatus(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warn';
      case 'Suspended':
        return 'danger';
      default:
        return 'secondary';
    }
}
}
