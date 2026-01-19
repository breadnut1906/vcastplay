import { Component, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UserService } from '../users/user.service';
import { UtilityService } from '../../../core/services/utility.service';
import { RoleService } from '../roles/role.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
