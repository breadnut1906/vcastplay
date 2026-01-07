import { Component, inject, Input, TemplateRef } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Playlist } from '../playlist';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-playlist-list-item',
  imports: [ PrimengUiModule ],
  templateUrl: './playlist-list-item.component.html',
  styleUrl: './playlist-list-item.component.scss'
})
export class PlaylistListItemComponent {

  @Input() playlist!: Playlist;
  @Input() actionBtn!: TemplateRef<any>;

  utils = inject(UtilityService)

}
