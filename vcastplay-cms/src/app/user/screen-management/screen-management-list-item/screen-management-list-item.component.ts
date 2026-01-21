import { Component, effect, inject, Input, signal, TemplateRef } from '@angular/core';
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
  @Input() selectMultipleScreens = signal<Screen[]>([]);
  @Input() actionBtn!: TemplateRef<any>;

  screenService = inject(ScreenService);
  utils = inject(UtilityService);
  
  onSelectItem(screen: Screen) {
    const index = this.selectMultipleScreens().findIndex(item => item.id === screen.id);
    if (index !== -1) this.selectMultipleScreens.update(current => current.filter(item => item.id !== screen.id));
    else this.selectMultipleScreens.update(current => [...current, screen]);
  }

  get isSelected() {
    return this.selectMultipleScreens().find(item => item.id === this.screen.id) ? true : false;
  }
}
