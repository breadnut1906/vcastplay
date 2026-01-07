import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilityService } from '../../services/utility.service';
import { ComponentsModule } from '../../modules/components/components.module';

@Component({
  selector: 'app-admin-layout',
  imports: [ RouterOutlet, ComponentsModule ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {

  utils = inject(UtilityService);

  get menuItems() {
    return this.utils.adminModules();
  }
}
