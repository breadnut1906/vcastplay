import { Component, inject, signal } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { User } from '../../shared/interfaces/account-settings';
import { Pagination } from '../../shared/interfaces/general';
import { UserService } from './user.service';
import { ComponentsModule } from '../../core/modules/components/components.module';
import { UtilityService } from '../../core/services/utility.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  
  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Users Management'} ];

  userService = inject(UserService);
  message = inject(MessageService);
  utils = inject(UtilityService);
  
  users = signal<User[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  isLoading = signal<boolean>(false);
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

  constructor() { }

  ngOnInit() {
    this.onLoadUsers()
  }

  onLoadUsers(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.userService.onGetUsers(page, limit).subscribe({
      next: (res: any) => {
        const { items, meta } = res;
        this.users.set(items);
        this.pagination.set(meta);
      },
      error: (err) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message }),
      complete: () => this.isLoading.set(false)
    })
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onLoadUsers(pageNumber, event.rows);
  }

  onClickEdit(user: User) {
    this.isEdit.set(true);
    this.userForm.patchValue(user);
    this.showDialog.set(true);
  }

  onClickSave(event: Event) { }

  onClickDelete(user: User, event: Event) { }
}
