import { Component, Input, TemplateRef } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-role-list-item',
  imports: [ PrimengUiModule ],
  templateUrl: './role-list-item.component.html',
  styleUrl: './role-list-item.component.scss'
})
export class RoleListItemComponent {

  @Input() item!: any;
  @Input() actionBtn!: TemplateRef<any>;

}
