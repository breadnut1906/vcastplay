import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { PlaylistService } from '../../playlist/playlist.service';
import { Playlist } from '../../playlist/playlist';
import { MessageService } from 'primeng/api';
import { Assets } from '../assets';
import { Pagination } from '../../../shared/interfaces/general';
import { UtilityService } from '../../../core/services/utility.service';
import { FiltersComponent } from '../../../shared/components/filters/filters.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-asset-to-playlist',
  imports: [ PrimengUiModule, FiltersComponent, PaginatorComponent ],
  templateUrl: './asset-to-playlist.component.html',
  styleUrl: './asset-to-playlist.component.scss'
})
export class AssetToPlaylistComponent {

  @Input() dialog = signal<boolean>(false);

  @Output() onSelectedPlaylistChange = new EventEmitter<Playlist[]>();

  playlistService = inject(PlaylistService);
  message = inject(MessageService);
  utils = inject(UtilityService);

  playlists = signal<Playlist[]>([]);
  selectedPlaylists = signal<Playlist[] | any[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  isLoading = signal<boolean>(false);

  onInitializedPlaylists(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.playlistService.onLoadPlaylist(page, limit).subscribe({
      next: (res: any) => {
        this.playlists.set(res.items);
        this.pagination.set(res.meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    })
  }

  onCloseDialog() {
    this.onSelectedPlaylistChange.emit(this.selectedPlaylists());
    this.selectedPlaylists.set([]);
  }

  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializedPlaylists(pageNumber, event.rows);
  }

  onClickSave(event: Event) {    
    // Add confirmation dialog
    this.onSelectedPlaylistChange.emit(this.selectedPlaylists());
    this.selectedPlaylists.set([]);
    this.dialog.set(false);
  }

}
