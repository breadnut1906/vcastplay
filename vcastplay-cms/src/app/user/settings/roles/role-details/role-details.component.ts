import { Component, inject, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { RoleService } from '../role.service';
import { UtilityService } from '../../../../core/services/utility.service';

@Component({
  selector: 'app-role-details',
  imports: [ PrimengUiModule ],
  templateUrl: './role-details.component.html',
  styleUrl: './role-details.component.scss'
})
export class RoleDetailsComponent {

  @Input() roleForm!: FormGroup;

  roleService = inject(RoleService);
  utils = inject(UtilityService);

  isModuleSelected(module: any) {
    return this.moduleCtrl?.value.some((m: any) => m.label === module.label);
  }

  onAddModule(module: any) {
    const moduleCtrl = this.moduleCtrl?.value;
    const index = moduleCtrl.findIndex((m: any) => m.label === module.label);
    if (index !== -1) {
      moduleCtrl.splice(index, 1);
    } else {
      moduleCtrl.push(module);
    } 
  }

  formControl(fieldName: string) {
    return this.roleForm.get(fieldName);
  }

  get modules() {
    return this.utils.modules();
  }
  
  get moduleCtrl() {
    return this.roleForm.get('modules');
  }
}
