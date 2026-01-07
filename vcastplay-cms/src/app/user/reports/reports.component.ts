import { Component } from '@angular/core';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../core/modules/components/components.module';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-reports',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {

  pageInfo: MenuItem = [ { label: 'Reports' }, { label: 'Lists' } ];
  
}
