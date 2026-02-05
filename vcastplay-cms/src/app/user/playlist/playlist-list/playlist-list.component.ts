import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Playlist } from '../playlist';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { Pagination } from '../../../shared/interfaces/general';

@Component({
  selector: 'app-playlist-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './playlist-list.component.html',
  styleUrl: './playlist-list.component.scss',
})
export class PlaylistListComponent {

  pageInfo: MenuItem = [ { label: 'Playlists' }, { label: 'Library' } ];
  actionItems: MenuItem[] = [
    { 
      label: 'Options',
      items: [
        { label: 'Preview', icon: 'pi pi-eye', command: ($event: any) => { this.onClickPreview(this.selectedPlaylist()); } },
        { label: 'Duplicate', icon: 'pi pi-copy', command: ($event: any) => this.onClickDuplicate(this.selectedPlaylist(), $event) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete(this.selectedPlaylist(), $event), styleClass: 'delete-menu-item' }  
      ]
    }
  ];

  playlistService = inject(PlaylistService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);

  playlists = signal<Playlist[] | any[]>([]);
  playlist = signal<Playlist | any>(null);
  selectedPlaylist = signal<Playlist | any>(null);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  isLoading = signal<boolean>(false);

  showPreview = signal<boolean>(false);
  showApprove = signal<boolean>(false);
  setToScreen = signal<boolean>(false);
  showGenerate = signal<boolean>(false);

  previewContent = signal<Playlist | any>(null);

  ngOnInit() {
    this.onInitializePlaylists();
  }

/**
 * Initialize playlist list
 * @param page The page number to load
 * @param limit The limit of items per page
 */
  onInitializePlaylists(page: number = 1, limit: number = 10) {
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

  onClickAddNew() {
    this.router.navigate([ '/playlist/playlist-details' ]);
  }

  onClickEdit(playlist: Playlist) {
    this.router.navigate([ '/playlist/playlist-details'], { queryParams: { id: playlist.id }} );
  }

  onClickDelete(playlist: any, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this playlist?',
      closable: true,
      closeOnEscape: true,
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.playlistService.onDeletePlaylist(playlist).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Playlist deleted successfully!' }),
          error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to delete playlist!' }),
          complete: () => this.onInitializePlaylists()
        });
      },
      reject: () => { }
    })
  }

  onClickDuplicate(playlist: Playlist, event: any) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to duplicate this playlist?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Duplicate',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Duplicate',
      },
      accept: () => {
        this.message.add({ severity:'success', summary: 'Success', detail: 'Playlist duplicated successfully!' })
      },
      reject: () => { }
    })
  }

  /**
   * Click event handler for the preview button. Retrieves the playlist
   * with the given id and displays its content in a dialog.
   * @param playlist The playlist object to be previewed.
   */
  onClickPreview(item: Playlist | any) {
    this.playlistService.onGetPlaylistById(item.id).subscribe({
      next: (res: any) => this.playlist.set(res[0]),
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.showPreview.set(true)
    })
  }

  onClickOptions(event: Event, playlist: Playlist, menu: Menu) {
    this.selectedPlaylist.set(playlist);
    menu.toggle(event);
  }

  onClickShowApproved(event: any, item: any, popup: any) {
    popup.toggle(event);
  }

  onClickSetToScreen(event: any, item: any) {
    this.playlistService.onGetPlaylistById(item.id).subscribe({
      next: (res: any) => this.selectedPlaylist.set({ type: 'playlist', content: res[0] }),
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.setToScreen.set(true)
    })
  }

  onClickCloseApproved(event: Event, popup: any) {
    this.showApprove.set(false);
    popup.hide();
  }

  onClickGetContents() {
    this.showGenerate.set(true)
  }

  onFilterChange(event: any) {  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializePlaylists(pageNumber, event.rows);
  }

  onAutoGenerateChange(event: any) { }

  get isEditMode() { return this.playlistService.isEditMode; }
  get categoryForm() { return this.playlistService.categoryForm; }
  get selectedAssets() { return this.playlistService.selectedAssets; }
  get filteredAssets() { return this.playlistService.filteredAssets; }

  get playlistFilterForm() { return this.playlistService.playlistFilterForm; }
}
