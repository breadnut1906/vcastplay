import { computed, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Roles } from '../../../shared/interfaces/account-settings';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private roleSignal = signal<Roles[]>([]);
  roles = computed(() => this.roleSignal());

  loadingSignal = signal<boolean>(false);
  showDialog = signal<boolean>(false);
  
  roleForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [ Validators.required ]),
    description: new FormControl('', [ Validators.required ]),
    modules: new FormControl([], { nonNullable: true }),
    status: new FormControl(''),
  })

  constructor() { }

  onLoadRoles() {
    /**Call GET roles API */
    this.loadingSignal.set(true);
    this.roleSignal.set([
      {
        id: 1,
        name: "Admin",
        description: "Has full access to all modules and settings.",
        modules: [],
        status: "Active",
        createdOn: new Date("2024-01-01"),
        updatedOn: new Date("2024-02-01"),
      },
      {
        id: 2,
        name: "Editor",
        description: "Can manage content but has limited access to settings.",
        modules: [],
        status: "Active",
        createdOn: new Date("2024-01-05"),
        updatedOn: new Date("2024-02-05"),
      },
      {
        id: 3,
        name: "Viewer",
        description: "Can only view reports and dashboards.",
        modules: [],
        status: "Active",
        createdOn: new Date("2024-01-10"),
        updatedOn: new Date("2024-02-10"),
      },
      {
        id: 4,
        name: "Moderator",
        description: "Manages user-generated content and enforces policies.",
        modules: [],
        status: "Inactive",
        createdOn: new Date("2024-01-15"),
        updatedOn: new Date("2024-02-15"),
      },
      {
        id: 5,
        name: "Support",
        description: "Handles user issues and provides assistance.",
        modules: [],
        status: "Active",
        createdOn: new Date("2024-01-20"),
        updatedOn: new Date("2024-02-20"),
      }
    ]);
    this.loadingSignal.set(false);
  }

  onGetRoles() {
    if (this.roleSignal().length === 0) this.onLoadRoles();
    return this.roleSignal();
  }

  onRefreshRoles() {
    this.roleSignal.set([]);
    this.onLoadRoles();
  }
  
  onSaveRole(role: Roles) {
    const tempRoles = this.roleSignal();
    const { id, status, ...info } = role;
    const index = tempRoles.findIndex(r => r.id === id);
    if (index !== -1) tempRoles[index] = { ...tempRoles[index], ...info };
    else tempRoles.push({ id: tempRoles.length + 1, status: 'pending', ...info, createdOn: new Date(), updatedOn: new Date() });

    this.roleSignal.set([...tempRoles]);
    /**Call POST/PATCH role API */
  }

  onDeleteRole(role: Roles) {
    /**Call DELETE role API */
    this.roleSignal.set(this.roleSignal().filter(r => r.id !== role.id));
  }
}
