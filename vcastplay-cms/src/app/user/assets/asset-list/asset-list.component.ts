import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { UtilityService } from '../../../core/services/utility.service';
import { AssetsService } from '../assets.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { PlaylistService } from '../../playlist/playlist.service';
import { Assets, UploadResults } from '../assets';

@Component({
  selector: 'app-asset-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './asset-list.component.html',
  styleUrl: './asset-list.component.scss',
})
export class AssetListComponent {

  pageInfo: MenuItem = [ { label: 'Assets' }, { label: 'Lists' } ];
  actionItems: MenuItem[] = [
    { 
      label: 'Options',
      items: [
        { label: 'Preview', icon: 'pi pi-eye', command: ($event: any) => this.isShowPreview.set(true) },
        { label: 'Duplicate', icon: 'pi pi-copy', command: ($event: any) => this.onClickDuplicate(this.selectedAsset(), $event) },
        { label: 'Add to Playlist', icon: 'pi pi-list', command: ($event: any) => this.onClickAddToPlaylist(this.selectedAsset(), $event) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete(this.selectedAsset(), $event) }
      ]
    }
  ];

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);

  assetViewModeSignal = signal<string>('Grid');
  isShowPreview = signal<boolean>(false);
  isShowAddToPlaylist = signal<boolean>(false);

  // upload file variables
  isUploading = signal<boolean>(false);
  isShowUploadResult = signal<boolean>(false);
  fileIndex = signal<number>(0);
  totalFiles = signal<number>(0);
  uploadingProgress = signal<number>(0);
  updatingProgress = computed(() => Math.floor((this.fileIndex() / this.totalFiles()) * 100));
  uploadResults = signal<UploadResults[]>([]);

  assetViewModeCtrl: FormControl = new FormControl('Grid');

  assetFilters = signal<any>(this.assetFilterForm.valueChanges);
  audienceTagSignal = signal<any>({});
  filteredAssets = computed(() => {
    const { category, subCategory, type, keywords, orientation }: any = this.assetFilters();
    const assets = this.assetService.assets();

    const data = assets;    

    const filteredAssets = data.filter(asset => {
      const matchesCategory = category ? asset.category?.toLowerCase().includes(category.toLowerCase()) : true;
      const matchesSubCategory = subCategory ? asset.subCategory?.toLowerCase().includes(subCategory.toLowerCase()) : true;
      const matchesType = type ? asset.type?.toLowerCase().includes(type.toLowerCase()) : true;
      const matchesKeywords = keywords ? asset.name?.toLowerCase().includes(keywords.toLowerCase()) : true;
      // const matchesOrientation = orientation ? asset.fileDetails.orientation?.toLowerCase().includes(orientation.toLowerCase()) : true;

      return matchesCategory && matchesSubCategory && matchesType && matchesKeywords //&& matchesOrientation;
    });

    return filteredAssets;
  });

  constructor() {
    this.assetViewModeCtrl.valueChanges.subscribe(value => this.assetViewModeSignal.set(value));
  }

  ngOnInit() {
    this.assetService.onGetAssets()
  }

  async onFileSelectOrDrop(event: DragEvent | Event | any) {
    this.isUploading.set(true);
    this.uploadResults.set([]);
    const files = event.dataTransfer?.files || event.target.files || [];
    this.totalFiles.set(files.length);
    for (const file of await files) {    
      this.fileIndex.set(this.fileIndex() + 1);
        
      if (file.type && file.type.startsWith('audio/')) {
        const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'];
        if (!allowedTypes.includes(file.type)) {
          this.uploadResults().push({ name: file.name, status: 'error', message: 'Only mp3/mpeg, wav and ogg files are allowed for audio files' });
          continue;
        }
      }

      if (file.type && file.type.startsWith('video/')) {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(file.type)) {
          this.uploadResults().push({ name: file.name, status: 'error', message: 'Only mp4, webm and ogg files are allowed for video files' });
          continue;
        }
      }

      try {
        const result = await this.assetService.processFile(file);        
        if (result) {
          this.assetForm.patchValue(result);
          this.assetService.onSaveAssets(this.assetForm.value)
          this.uploadResults().push({ name: file.name, status: 'success' });
        } else {
          this.uploadResults().push({ name: file.name, status: 'error' });
        }
      } catch (error: any) {
        this.uploadResults().push({ name: file.name, status: 'error', message: error.message });
      }
    }

    this.fileIndex.set(0);
    this.isUploading.set(false);
    this.assetForm.reset();
    const successCount = this.uploadResults().filter(result => result.status === 'success').length;    
    if (successCount === files.length) {
      this.message.add({ severity: 'success', summary: 'Success', detail: `${files.length} file(s) uploaded successfully!` });
    } else {
      this.isShowUploadResult.set(true);
      this.message.add({ severity: 'warn', summary: 'Warning', detail: `Some files are not uploaded due to an error.` });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onClickAddNew() {
    this.assetForm.reset();
    this.isEditMode.set(false);
    this.router.navigate([ '/assets/asset-details' ]);
  }

  onClickEdit(asset: Assets) {
    this.isEditMode.set(true);
    this.assetForm.patchValue(asset);   
    this.router.navigate([ '/assets/asset-details' ]);
  }

  onClickDuplicate(item: any, event: Event) {
    this.assetService.onDuplicateAssets(item);
    this.message.add({ severity:'success', summary: 'Success', detail: 'Asset duplicated successfully!' });
    this.selectedAsset.set(null);
  }

  onClickAddToPlaylist(item: any, event: Event) {
    this.playlistService.onGetPlaylists();
    this.isShowAddToPlaylist.set(true);
    this.assetForm.patchValue(item);
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
        this.assetService.onDeleteAssets(item);
        this.message.add({ severity:'success', summary: 'Success', detail: 'User deleted successfully!' });
        this.selectedAsset.set(null);
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

  onFilterChange(event: any) {
    const { filters, audienceTag } = event
    this.assetFilters.set(filters);
    this.audienceTagSignal.set(audienceTag);
  }

  get isMobile() { return this.utils.isMobile(); }
  get isTablet() { return this.utils.isTablet(); }

  get rows() { return this.assetService.rows; }
  get first() { return this.assetService.first; }
  get assetForm() { return this.assetService.assetForm; }
  get showPrompt() { return this.assetService.showPrompt; }
  get isEditMode() { return this.assetService.isEditMode; }
  get totalRecords() { return this.assetService.totalRecords; }
  get selectedAsset() { return this.assetService.selectedAsset; }
  get assetViewModes() { return this.assetService.assetViewModes; }
  get assetFilterForm() { return this.assetService.assetFilterForm; }
  get selectedArrAssets() { return this.assetService.selectedArrAssets; }

  get selectedArrPlaylist() { return this.playlistService.selectedArrPlaylist; }
}
