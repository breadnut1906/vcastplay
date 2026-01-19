import { Component, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { User } from '../../../../shared/interfaces/account-settings';
import { UtilityService } from '../../../../core/services/utility.service';
import { UserService } from '../user.service';
import { RoleService } from '../../roles/role.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Pagination } from '../../../../shared/interfaces/general';

@Component({
  selector: 'app-users',
  imports: [ PrimengUiModule, ComponentsModule,  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  
  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Users Management'} ];

  userService = inject(UserService);
  roleService = inject(RoleService);
  utils = inject(UtilityService);
  
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  
  users = signal<User[]>([]);
  paginatedUsers = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  userLoading = signal<boolean>(false);
  showDialog = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  userForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    // code: new FormControl(''),
    firstName: new FormControl('', [ Validators.required ]),
    middleName: new FormControl(''),
    lastName: new FormControl('', [ Validators.required ]),
    email: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required ]),
    mobileNo: new FormControl('', [ Validators.required ]),
    // role: new FormControl('', [ Validators.required ]),
    // status: new FormControl(''),
    // expiredAt: new FormControl(''),
  })

  securityForm: FormGroup = new FormGroup({
    password: new FormControl('', [ Validators.required ]),
    newPassword: new FormControl(null, [ 
      Validators.required, 
      Validators.minLength(6), 
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
      this.userService.forbiddenStartValidator() 
    ]),
    confirmNewPassword: new FormControl(null, [ Validators.required ])
  }, { validators: this.userService.passMatchValidator });

  ngOnInit() { 
    this.onInitializeData();
  }

  onInitializeData(page: number = 1, limit: number = 10) {
    this.userLoading.set(true);
    this.userService.onLoadUsers().subscribe({
      next: (res: any) => {
        this.users.set(res.items);
        this.paginatedUsers.set(res.meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.userLoading.set(false)
    });
  }
  
  onClickRefresh() {
    this.onInitializeData();
  }

  onClickAddNew() {
    this.showDialog.set(true);
    this.userForm.reset();
  }

  onClickEdit(user: User) {
    this.userForm.patchValue(user);
    this.showDialog.set(true);
    this.isEdit.set(true);
  }
  
  onClickSave(event: Event) {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        const { id, mobileNo, ...data } = this.userForm.value;
        const mode = this.isEdit() ? 'edit' : 'create';
        this.userService.onSaveUser(id, { mobileNo: this.isEdit() ? mobileNo : `0${mobileNo}`, ...data} , mode).subscribe({
          next: (res: any) => {
            this.message.add({ severity:'success', summary: 'Success', detail: 'User saved successfully!' });
            if (mode === 'create') this.onSaveNewUsers(res);
            else this.onUpdateUser(res);
          },
          error: () => this.message.add({ severity:'error', summary: 'Error', detail: 'Failed to save user!' }),
          complete: () => {
            this.showDialog.set(false);
            this.userForm.reset();
            this.isEdit.set(false);
          }
        });
      },
    })
  }

  onClickDelete(user: User, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this user?',
      closable: true,
      closeOnEscape: true,
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.userService.onDeleteUser(user).subscribe({
          next: () => {
            this.message.add({ severity:'success', summary: 'Success', detail: 'User deleted successfully!' });
          },
          error: () => this.message.add({ severity:'error', summary: 'Error', detail: 'Failed to delete user!' }),
          complete: () => {
            this.users().splice(this.users().findIndex(x => x.id === user.id), 1);
          }
        });
      },
      reject: () => { }
    })
  }

  onClickCancel() {
    this.showDialog.set(false);
    this.isEdit.set(false);
    this.userForm.reset();
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.paginatedUsers();
    this.paginatedUsers.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializeData(pageNumber, event.rows);
  }

  onSaveNewUsers(item: User) {
    this.users().unshift(item);
  }

  onUpdateUser(item: User) {
    const index = this.users().findIndex(x => x.id === item.id);
    if (index !== -1) this.users()[index] = item;
  }
}
