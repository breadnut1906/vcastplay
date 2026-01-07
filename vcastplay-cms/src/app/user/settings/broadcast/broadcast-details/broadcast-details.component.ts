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
  utils = inject(UtilityService);

  filterCategories = null //computed(() => this.tagsLists().find(tag => tag.id.includes('categories')).data());

  get icons() { return this.utils.icons; }

  get tagsLists() { return null } //this.tagService.tagsLists; }

  get broadCastMessageForm() { return this.broadcastService.broadCastMessageForm; }
}
