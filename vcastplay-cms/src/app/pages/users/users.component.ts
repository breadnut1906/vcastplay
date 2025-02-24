import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../core/modules/components/components.module';
import { MenuItem } from 'primeng/api';
import { User } from '../../core/interfaces/account-settings';
import { UtilityService } from '../../core/services/utility.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  showDialog = signal<boolean>(false);
  utils = inject(UtilityService)
  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Users'} ];

  users: User[] = [];

  userForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    code: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    mobile: new FormControl(''),
    role: new FormControl(''),
    status: new FormControl('')
  })

  ngOnInit() {
    this.users =  [
      {
          id: 1,
          code: 'USR001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: 1234567890,
          role: null,
          status: 'Active',
          createdOn: new Date('2024-01-01'),
          updatedOn: new Date('2024-02-01'),
      },
      {
          id: 2,
          code: 'USR002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          mobile: 9876543210,
          role: null,
          status: 'Active',
          createdOn: new Date('2024-01-05'),
          updatedOn: new Date('2024-02-05'),
      },
      {
          id: 3,
          code: 'USR003',
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com',
          mobile: 1122334455,
          role: null,
          status: 'Inactive',
          createdOn: new Date('2024-01-10'),
          updatedOn: new Date('2024-02-10'),
      },
      {
          id: 4,
          code: 'USR004',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          mobile: 2233445566,
          role: null,
          status: 'Active',
          createdOn: new Date('2024-01-15'),
          updatedOn: new Date('2024-02-15'),
      },
      {
          id: 5,
          code: 'USR005',
          firstName: 'Robert',
          lastName: 'Brown',
          email: 'robert.brown@example.com',
          mobile: 3344556677,
          role: null,
          status: 'Suspended',
          createdOn: new Date('2024-01-20'),
          updatedOn: new Date('2024-02-20'),
      },
  ];
  }

  onClickAddNew() {
    this.showDialog.set(true);
    this.userForm.reset();
  }

  onClickEdit(user: User) {
    this.userForm.patchValue(user);
    this.showDialog.set(true);
  }

  onClickSave() {
    // Save user data
    this.showDialog.set(false);
    this.userForm.reset();
  }

  onClickDelete(user: User) {
    // Confirmation dialog
  }
}
