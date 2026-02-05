import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { UtilityService } from '../../../core/services/utility.service';
import { AssetsService } from '../assets.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { PlaylistService } from '../../playlist/playlist.service';
import { Assets, UploadItem } from '../assets';
import { Pagination } from '../../../shared/interfaces/general';
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import moment from 'moment';
import { Playlist } from '../../playlist/playlist';

@Component({
  selector: 'app-asset-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './asset-list.component.html',
  styleUrl: './asset-list.component.scss',
})
export class AssetListComponent {

  publicApi: string = environment.public;

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  storage = inject(StorageService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  pageInfo: MenuItem = [ { label: 'Assets' }, { label: 'Lists' } ];
  actionItems: MenuItem[] = [
    { 
      label: 'Options',
      items: [
        { label: 'Preview', icon: 'pi pi-eye', command: ($event: any) => this.isShowPreview.set(true) },
        { label: 'Duplicate', icon: 'pi pi-copy', command: ($event: any) => this.onClickDuplicate(this.selectedAsset(), $event) },
        { label: 'Add to Playlist', icon: 'pi pi-list', command: ($event: any) => this.onClickAddToPlaylist(this.selectedAsset(), $event) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete(this.selectedAsset(), $event), styleClass: 'delete-menu-item' },
      ]
    }
  ];

  otherItems: MenuItem[] = [
    { 
      label: 'More',
      items: [
        { label: 'Add to Playlist', icon: 'pi pi-list', command: ($event: any) => this.onClickMultipleToPlaylist($event) },
        { label: 'Audience Tag', icon: 'pi pi-users', command: ($event: any) => this.onClickAudienceTag($event) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDeleteMultiple($event), styleClass: 'delete-menu-item' },
      ]
    }
  ];

  assets = signal<Assets[]>([]);
  selectedArrAssets = signal<Assets[]>([]);
  selectedAsset = signal<Assets | any>(null);
  isEdit = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isShowUpload = signal<boolean>(false);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });

  assetViewModeSignal = signal<string>('Grid');
  isShowPreview = signal<boolean>(false);
  addToPlaylist = signal<boolean>(false);
  showAudienceTag = signal<boolean>(false);

  assetViewModeCtrl: FormControl = new FormControl('Grid');
  selectionModeCtrl: FormControl = new FormControl(false);

  constructor() {
    this.assetViewModeCtrl.valueChanges.subscribe(value => this.assetViewModeSignal.set(value));
  }

  ngOnInit() {
    this.onInitializedAssets();
  }

  onInitializedAssets(page: number = 1, itemsPerPage: number = 10) {
    this.isLoading.set(true);
    this.assetService.onLoadAssets(page, itemsPerPage).subscribe({
      next: (res: any) => {
        const { items, meta } = res;
        this.assets.set(items);
        this.pagination.set(meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    });
  }

  onClickAddNew() {
    this.isShowUpload.set(true);
  }

  onClickEdit(asset: Assets) {
    this.router.navigate([ '/assets/asset-details' ], { queryParams: { id: asset.id } });
  }

  onClickDuplicate(item: any, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to duplicate this asset?',
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
        this.message.add({ severity:'success', summary: 'Success', detail: 'Asset duplicated successfully!' })
      },
      reject: () => { }
    })
  }

  onClickAddToPlaylist(item: any, event: Event) {
    this.selectedAsset.set(item);
    this.addToPlaylist.set(true);
  }

  onClickMultipleToPlaylist(event: Event) {
    const selectedAssets: Assets[] = this.selectedArrAssets();
    if (selectedAssets.length == 0) return this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one asset' });
    this.addToPlaylist.set(true);
  }

  onClickDelete(item: any, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this asset?',
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
        this.assetService.onDeleteAssets(item).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Asset deleted successfully!' }),
          error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to delete asset!' }),
          complete: () => this.onInitializedAssets()
        });
      },
      reject: () => { }
    })
  }

  onClickDeleteMultiple(event: Event) {
    const selectedAssets: Assets[] = this.selectedArrAssets();
    if (!selectedAssets.length || selectedAssets.length === 0) return this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one asset' });

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: `Do you want to delete ${selectedAssets.length} assets?`,
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
      accept: async () => {
        const result: any = await Promise.all(selectedAssets.map(item =>
          firstValueFrom(this.assetService.onDeleteAssets(item).pipe(catchError(err => of({ error: err, item })))
        )));
        if (result.some((item: any) => item.error)) {
          this.message.add({ severity:'error', summary: 'Error', detail: result.find((item: any) => item.error).error.error.message || 'Failed to delete asset!' });
        } else {
          this.message.add({ severity:'success', summary: 'Success', detail: 'Assets deleted successfully!' });
        }
        this.selectedArrAssets.set([]);
        this.onInitializedAssets(1, 10);
      },
      reject: () => { }
    })
  }

  onClickRefresh() { }

  onClickPreview() {
    this.isShowPreview.set(!this.isShowPreview());
  }

  onClickOpenOptions(event: Event, item: any, menu: any) {
    this.selectedAsset.set(item);
    menu.toggle(event);
  }

  onClickAudienceTag(event: Event) {
    const selectedAssets: Assets[] = this.selectedArrAssets();
    if (!selectedAssets.length || selectedAssets.length === 0) return this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one asset' });

    this.showAudienceTag.set(true);
  }

  onFilterChange(event: any) { }

  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializedAssets(pageNumber, event.rows);
  }

  isShowDialogChange(event: any) {
    this.isEdit.set(false);
    this.selectedAsset.set(null);
    this.onInitializedAssets();
  }

  isSelected(id: number): boolean {
    return this.selectedArrAssets().find(item => item.id === id) ? true : false;
  }

  onAssetItemChange(asset: Assets) {
    const assets = this.selectedArrAssets();
    const index = assets.findIndex(item => item.id === asset.id);
    if (index !== -1) assets.splice(index, 1);
    else assets.push(asset);
    this.selectedArrAssets.set(assets);
    this.cdr.detectChanges();
  }

  onAudienceTagChange(event: any) {
    const selectedAssets: Assets[] = this.selectedArrAssets();
    selectedAssets.forEach((item: Assets) => {
      this.assetService.onUpdateAssets(item.id, { audienceTags: event }).subscribe({
        next: (res: any) => {
          const asset = this.assets().find(asset => asset.id == item.id);
          if (asset) asset.updatedAt = moment().toISOString();
        }
      });
    })
    this.selectedArrAssets.set([]);
  }

  onSelectedPlaylistChange(playlist: Playlist[]) {
    if (playlist.length == 0) {
      this.selectedAsset.set(null);
      return;
    }
    
    const selectedAssets: Assets[] = this.selectedAsset() ? [ this.selectedAsset() ] : this.selectedArrAssets();
    console.log(selectedAssets, playlist);
  }

  get isMobile() { return this.utils.isMobile(); }
  get isTablet() { return this.utils.isTablet(); }

  get showPrompt() { return this.assetService.showPrompt; }
  get assetViewModes() { return this.assetService.assetViewModes; }

  get tenantId() {
    return this.storage.get('id');
  }

  get hasSelectedAssets() {
    return this.selectedArrAssets().length > 0;
  }

  get isMultipleSeletion() {
    return this.selectionModeCtrl.value as boolean;
  }
}
