import { Component, inject, Input } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { FormGroup } from '@angular/forms';
import { UserService } from '../user.service';
import { RoleService } from '../../roles/role.service';

@Component({
  selector: 'app-user-details',
  imports: [ PrimengUiModule ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent {

  @Input() userForm!: FormGroup;

  userService = inject(UserService);
  roleService = inject(RoleService);

  formControl(fieldName: string) {
    return this.userForm.get(fieldName);
  }

  get showDialog() {
    return this.userService.showDialog;
  }

  get isEdit() {
    return this.userService.isEdit;
  }
}
