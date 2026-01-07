import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-breadcrumbs',
  imports: [ PrimengUiModule ],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent {

  @Input() menu: MenuItem | any;

  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
}
