import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-playlist-filter',
  imports: [ PrimengUiModule ],
  templateUrl: './playlist-filter.component.html',
  styleUrl: './playlist-filter.component.scss'
})
export class PlaylistFilterComponent {
    
  @Output() filterChange = new EventEmitter<any>();

  playlistService = inject(PlaylistService);

  useFilter = signal<boolean>(false);

  onClickApply(filter: any) {
    const filters = this.playlistFilterForm.value;
    this.filterChange.emit({ filters });
    this.useFilter.set(true);
    filter.hide();
  }

  onClickClear(filter: any) {
    this.playlistFilterForm.reset();
    this.filterChange.emit({ filters: this.playlistFilterForm.value });
    this.useFilter.set(false);
    filter.hide();
  }

  get playlistStatus() { return this.playlistService.playlistStatus; }
  get playListTypes() { return this.playlistService.playListTypes; }
  get playlistFilterForm() { return this.playlistService.playlistFilterForm; }
}
