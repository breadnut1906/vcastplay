import { Component, computed, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { AssetsService } from '../../assets/assets.service';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { v7 as uuidv7 } from 'uuid';
import moment from 'moment';
import { Assets } from '../../assets/assets';
import { DesignLayout } from '../../design-layout/design-layout';

@Component({
  selector: 'app-playlist-details',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './playlist-details.component.html',
  styleUrl: './playlist-details.component.scss',
})
export class PlaylistDetailsComponent {
  
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  pageInfo: MenuItem = [ {label: 'Playlists'}, {label: 'Library', routerLink: '/playlist/playlist-library'}, {label: 'Details'} ];

  utils = inject(UtilityService);
  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);

  moment = moment;

  keywords: FormControl = new FormControl('');
  keywordSignal = signal<string>('');

  isExpanded = signal<boolean>(true);

  assetFilters = signal<any>(this.assetFilterForm.valueChanges);
  audienceTagSignal = signal<any>({});
  filteredAssets = computed(() => {
    const { category, subCategory, type, keywords, orientation }: any = this.assetFilters();
    const assets = this.assetService.assets();
    const hasAnyValue = Object.values(this.audienceTagSignal()).some(arr => Array.isArray(arr) && arr.length > 0);
    const filteredItems = this.utils.onFilterItems(assets, this.audienceTagSignal());
    const data = hasAnyValue ? filteredItems : assets;    

    const filteredAssets = data.filter(asset => {
      const matchesCategory = category ? asset.category?.toLowerCase().includes(category.toLowerCase()) : true;
      const matchesSubCategory = subCategory ? asset.subCategory?.toLowerCase().includes(subCategory.toLowerCase()) : true;
      const matchesType = type ? asset.type?.toLowerCase().includes(type.toLowerCase()) : true;
      const matchesKeywords = keywords ? asset.name?.toLowerCase().includes(keywords.toLowerCase()) : true;
      const matchesOrientation = orientation ? asset.fileDetails.orientation?.toLowerCase().includes(orientation.toLowerCase()) : true;

      return matchesCategory && matchesSubCategory && matchesType && matchesKeywords && matchesOrientation;
    });

    return filteredAssets;
  });

  hasUnsavedChanges!: () => boolean;

  constructor() {
    this.keywords.valueChanges.subscribe(value => this.keywordSignal.set(value));
    this.assetViewModeCtrl.valueChanges.subscribe(value => this.assetViewModeSignal.set(value));

    effect(() => {
      const progress = this.playlistService.progress();
      if (progress > 0 && this.videoPlayer) this.playlistService.videoElement.set(this.videoPlayer.nativeElement);      
    })
  }
  
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }

  ngOnInit() { }

  ngOnDestroy(event: Event) {    
    this.isEditMode.set(false);
    this.playlistForm.markAsPristine();
    this.playlistForm.markAsUntouched();
    this.playlistForm.reset();
    this.playlistForm.reset({ contents: [] });
  }
  
  hasUnsavedData(): boolean {
    return this.playlistForm.invalid;
  }

  async onClickSave(event: Event) {
    if (this.playlistForm.invalid) {
      this.playlistForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      header: 'Confirm Save',
      icon: 'pi pi-question-circle',
      acceptButtonProps: { label: 'Save' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        console.log(this.playlistForm.value);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Playlist saved successfully!' });
        this.playlistService.onSavePlaylist({ ...this.playlistForm.value, duration: this.totalDuration(), isAuto: false });
        this.router.navigate([ '/playlist/playlist-library' ]);
      },
    });
  }
  
  onClickCancel() {
    // this.playlistForm.reset({ contents: [] });
    this.router.navigate([ '/playlist/playlist-library' ]);
  }

  onClickClearAll() {
    this.formControl('contents').setValue([]);
  }

  onFilterChange(event: any) {
    const { filters, audienceTag } = event    
    this.assetFilters.set(filters);
    this.audienceTagSignal.set(audienceTag);
  }

  onSelectionChange(event: Assets | DesignLayout | any) {
    const { contents, files } = this.playlistForm.value;   
    
    switch (event.type) {
      case 'design':
        const newFiles = event.files.filter((file: Assets) => !files.some((existingFile: Assets) => existingFile.id === file.id && existingFile.url === file.url));
        this.playlistForm.patchValue({ 
          files: [...files, ...newFiles]
        });
        break;
    
      default:
        const existingFile = files.find((file: Assets) => file.id === event.id && file.url === event.url);
        if (!existingFile) {
          this.playlistForm.patchValue({ 
            files: [...files, { id: event.id, name: event.name, url: event.url, duration: event.duration  } ]
          });
        } 
        break;
    }
    this.playlistForm.patchValue({ contents: [...contents, { ...event, contentId: uuidv7() }] });
  }

  onContentTypeChange(event: any) {
    console.log(event);
  }

  onCurrentItemChange(event: Assets | DesignLayout | any) {
    this.currentPlaying.set(event);
  }

  formControl(fieldName: string) {
    return this.utils.getFormControl(this.playlistForm, fieldName);
  }

  get activeStep() { return this.playlistService.activeStep; }
  get isEditMode() { return this.playlistService.isEditMode; }
  get playlistForm() { return this.playlistService.playListForm; }
  get totalDuration() { return this.playlistService.totalDuration; }
  get transitionTypes() { return this.playlistService.transitionTypes; }
  get showContents() { return this.playlistService.showContents; }

  get isPlaying() { return this.playlistService.isPlaying; }
  get currentPlaying() { return this.playlistService.currentPlaying; }

  get assets() { return this.assetService.assets; }
  get assetViewModes() { return this.assetService.assetViewModes; }
  get assetViewModeCtrl() { return this.assetService.assetViewModeCtrl; }
  get assetViewModeSignal() { return this.assetService.assetViewModeSignal; }
  get assetFilterForm() { return this.assetService.assetFilterForm; }

}
