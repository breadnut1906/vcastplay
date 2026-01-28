import { Component, computed, inject } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../../core/services/utility.service';
import { BroadcastService } from '../broadcast.service';
import { TagService } from '../../tags/tag.service';

@Component({
  selector: 'app-broadcast-details',
  imports: [ PrimengUiModule],
  templateUrl: './broadcast-details.component.html',
  styleUrl: './broadcast-details.component.scss'
})
export class BroadcastDetailsComponent {

  broadcastService = inject(BroadcastService);
  tagService = inject(TagService);

  get categories() { return this.broadcastService.broadcastCategories; }

  get broadCastMessageForm() { return this.broadcastService.broadCastMessageForm; }
}
