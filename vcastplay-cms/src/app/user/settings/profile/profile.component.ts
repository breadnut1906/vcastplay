import { Component, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UserService } from '../users/user.service';
import { UtilityService } from '../../../core/services/utility.service';
import { RoleService } from '../roles/role.service';

@Component({
  selector: 'app-profile',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  
  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Profile'} ];

  userService = inject(UserService);
  roleService = inject(RoleService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  ngOnInit() { }

  onClickUpdate(event: Event, type: string) {
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
        this.message.add({ severity:'success', summary: 'Success', detail: 'User saved successfully!' });
        this.userForm.reset();
      },
      reject: () => { 
        this.userForm.reset();
      }
    })
  }

  get userForm() {
    return this.userService.userForm;
  }

  get securityForm() {
    return this.userService.securityForm;
  }

  get currentPass() {
    return this.securityForm.get('password');
  }

  get newPass() {
    return this.securityForm.get('newPassword');
  }

  get confirmNewPass() {
    return this.securityForm.get('confirmNewPassword');
  }

}
