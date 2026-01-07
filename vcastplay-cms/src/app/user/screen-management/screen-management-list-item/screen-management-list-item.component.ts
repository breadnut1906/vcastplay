import { Component, effect, inject, Input, TemplateRef } from '@angular/core';
import { UtilityService } from '../../../core/services/utility.service';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Screen } from '../../screens/screen';
import { ScreenService } from '../../screens/screen.service';

@Component({
  selector: 'app-screen-management-list-item',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-management-list-item.component.html',
  styleUrl: './screen-management-list-item.component.scss'
})
export class ScreenManagementListItemComponent {

  @Input() screen!: Screen;
  @Input() actionBtn!: TemplateRef<any>;

  screenService = inject(ScreenService);
  utils = inject(UtilityService);
  
  get selectMultipleScreens() { return this.screenService.selectMultipleScreens; }
}
