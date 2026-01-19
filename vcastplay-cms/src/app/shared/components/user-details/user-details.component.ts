import { Component, inject, Input, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UserService } from '../../../admin/users/user.service';
import { RoleService } from '../../../user/settings/roles/role.service';

@Component({
  selector: 'app-user-details',
  imports: [ PrimengUiModule ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent {

  @Input() userForm!: FormGroup;
  @Input() isEdit = signal<boolean>(false);

  userService = inject(UserService);
  roleService = inject(RoleService);

  formControl(fieldName: string) {
    return this.userForm.get(fieldName);
  }
}
