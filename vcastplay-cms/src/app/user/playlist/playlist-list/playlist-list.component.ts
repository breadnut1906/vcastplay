import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Playlist } from '../playlist';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';

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
        { label: 'Duplicate', icon: 'pi pi-copy', command: ($event: any) => this.onClickDuplicate(this.selectedPlaylist()) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete(this.selectedPlaylist(), $event) }  
      ]
    }
  ];

  playlistService = inject(PlaylistService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);

  showPreview = signal<boolean>(false);
  showApprove = signal<boolean>(false);

  previewContent = signal<Playlist | any>(null);;

  playlistFilters = signal<any>(this.playlistFilterForm.valueChanges);
  filterPlaylist = computed(() => {
    const { status, keywords, isAuto } = this.playlistFilters();
    const playlists = this.playlistService.playlists();
    return playlists.filter(playlist => {
      const matchStatus = !status || playlist.status == status;
      const matchIsAuto = isAuto == null || playlist.isAuto == isAuto;
      const matchKeywords = !keywords || playlist.name.toLowerCase().includes(keywords.toLowerCase()) || playlist.description.toLowerCase().includes(keywords.toLowerCase());
      return matchStatus && matchKeywords && matchIsAuto;
    })
  })

  ngOnInit() {
    this.playlistService.onGetPlaylists();
  }

  onClickAddNew() {
    this.router.navigate([ '/playlist/playlist-details' ]);
  }

  onClickEdit(playlist: Playlist) {
    this.isEditMode.set(true);
    this.playlistForm.patchValue(playlist);
    this.router.navigate([ '/playlist/playlist-details' ]);
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
        this.playlistService.onDeletePlaylist(playlist);
        this.message.add({ severity:'success', summary: 'Success', detail: 'Playlist deleted successfully!' });
        this.selectedPlaylist.set(null);
        this.playlistForm.reset();
      },
      reject: () => { }
    })
  }

  onClickDuplicate(playlist: any) {
    const { approvedInfo, ...info } = playlist;
    this.playlistService.onDuplicatePlaylist(info);
    this.message.add({ severity:'success', summary: 'Success', detail: 'Playlist duplicated successfully!' });
  }

  onClickPreview(playlist: any) {
    this.showPreview.set(true);
    this.previewContent.set({ ...playlist, loop: true });
  }

  onClickOptions(event: Event, playlist: Playlist, menu: Menu) {
    this.selectedPlaylist.set(playlist);
    menu.toggle(event);
  }

  onClickShowApproved(event: any, item: any, popup: any) {
    popup.toggle(event);
    this.playlistForm.patchValue(item);
  }

  onClickConfirmApproved(event: Event, popup: any, type: string) {
    const { approvedInfo, ...info } = this.playlistForm.value;
    if (approvedInfo.remarks === '') {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Remarks is required!' });
      return;
    }
    this.showApprove.set(false);
    this.playlistService.onApprovePlaylist(this.playlistForm.value, type);
    this.playlistForm.reset();
    popup.hide();
  }

  onClickCloseApproved(event: Event, popup: any) {
    this.showApprove.set(false);
    popup.hide();
  }

  onClickGetContents() {
    this.showContents.set(true);
    this.activeStep.set(1);
  }

  onClickComplete(event: Event) {
    const contents = this.selectedAssets();
    if (contents.length === 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'No contents available' });
      return;
    };
    this.filteredAssets.set(contents);
    this.playlistForm.patchValue({ contents });
    this.showContents.set(false);
    this.playlistService.onSavePlaylist({ ...this.playlistForm.value, duration: this.totalDuration(), isAuto: true });
    this.message.add({ severity:'success', summary: 'Success', detail: `New playlist created with ${contents.length} contents` });
  }

  onFilterChange(event: any) { 
    this.playlistFilters.set(event.filters);
  }

  get rows() { return this.playlistService.rows; }
  get first() { return this.playlistService.first; }
  get playlists() { return this.playlistService.playlists; }
  get isEditMode() { return this.playlistService.isEditMode; }
  get activeStep() { return this.playlistService.activeStep; }
  get showContents() { return this.playlistService.showContents; }
  get totalRecords() { return this.playlistService.totalRecords; }
  get playlistForm() { return this.playlistService.playListForm; }
  get playListValue() { return this.playlistService.playListForm.value; }
  get categoryForm() { return this.playlistService.categoryForm; }
  get totalDuration() { return this.playlistService.totalDuration; }
  get selectedAssets() { return this.playlistService.selectedAssets; }
  get filteredAssets() { return this.playlistService.filteredAssets; }
  get selectedPlaylist() { return this.playlistService.selectedPlaylist; }
  
  get status() { return this.playlistForm.get('status'); }
  get approvedInfo() { return this.playlistForm.get('approvedInfo'); }

  get playlistFilterForm() { return this.playlistService.playlistFilterForm; }
}
