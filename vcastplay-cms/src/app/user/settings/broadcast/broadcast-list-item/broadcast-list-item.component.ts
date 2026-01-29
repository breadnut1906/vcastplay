import { Component, inject, Input, TemplateRef } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenMessage } from '../../../screens/screen';
import { UtilityService } from '../../../../core/services/utility.service';
import { BroadcastService } from '../broadcast.service';

@Component({
  selector: 'app-broadcast-list-item',
  imports: [ PrimengUiModule ],
  templateUrl: './broadcast-list-item.component.html',
  styleUrl: './broadcast-list-item.component.scss'
})
export class BroadcastListItemComponent {

  @Input() item!: ScreenMessage;
  @Input() actionBtn!: TemplateRef<any>;

  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);

  categories(screenMessage: ScreenMessage) {
    const category = this.broadcastService.broadcastCategories;
    const cat = category.find(cat => cat.category === screenMessage.category);
    return cat
  }
}
