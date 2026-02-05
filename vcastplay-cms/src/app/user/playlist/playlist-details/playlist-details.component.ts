import { Component, computed, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { AssetsService } from '../../assets/assets.service';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { v7 as uuidv7 } from 'uuid';
import moment, { duration } from 'moment';
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
  route = inject(ActivatedRoute);

  moment = moment;

  formBuilder = inject(FormBuilder);
  playlistForm = this.formBuilder.group({
    id: [0],
    name: ['New Playlist', Validators.required],
    description: ['Test Playlists', Validators.required],
    isAuto: [false],
    isLoop: [true],
    isBlackGap: [false],
    transition: ['fade'],
    transitionSpeed: [0],
    entries: [[], Validators.required],
  });
  isLoading = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  keywords: FormControl = new FormControl('');
  keywordSignal = signal<string>('');

  isExpanded = signal<boolean>(true);

  hasUnsavedChanges!: () => boolean;

  constructor() { }
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) $event.returnValue = true;
  }
  
  hasUnsavedData(): boolean {
    return this.playlistForm.invalid && this.playlistForm.dirty;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const { id } = params;
      if (id) {
        this.isEdit.set(true);
        this.onLoadPlaylistById(id);
      }
    })
  }

  ngOnDestroy(event: Event) {    
    this.isEdit.set(false);
    // this.playlistForm.markAsPristine();
    // this.playlistForm.markAsUntouched();
    // this.playlistForm.reset();
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
        const entries: any = this.formControl('entries').value;
        
        const newEntries = entries.map((entry: any, index: number) => {
          if (entry.type == 'asset') {
            return { assetId: entry.assetId, duration: entry.duration, sequence: entry.sequence, type: entry.type };
          } else {
            return { layoutId: entry.layoutId, duration: entry.duration, sequence: entry.sequence, type: entry.type };
          }
        })        
        this.playlistForm.patchValue({ entries: newEntries });
        const { id, ...playlist }: any = this.playlistForm.value;
        this.playlistService.onSavePlaylist(id, playlist, this.isEdit()).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Playlist saved successfully!' }),
          error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
          complete: () => this.router.navigate([ '/playlist/playlist-library' ])
        })
      },
    });
  }
  
  onClickCancel() {
    this.router.navigate([ '/playlist/playlist-library' ]);
  }

  onClickClearAll() {
    this.formControl('contents').setValue([]);
  }

  onFilterChange(event: any) { }

  onPlaylistContentChange(event: any) {
    const entries: any = this.formControl('entries').value;
    const newEntries: any = [ ...entries, event ].map((entry: any, index: number) => {
      return { ...entry, sequence: index + 1 };
    });    
    this.playlistForm.patchValue({ entries: newEntries });
  }

  onLoadPlaylistById(id: number) {
    this.isLoading.set(true);
    this.playlistService.onGetPlaylistById(id).subscribe({
      next: (res: any) => this.playlistForm.patchValue(res[0]),
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    })
  }


  onCurrentItemChange(event: Assets | DesignLayout | any) {
    this.currentPlaying.set(event);
  }

  formControl(fieldName: string) {
    return this.utils.getFormControl(this.playlistForm, fieldName);
  }

  totalDuration(): number {
    const { entries }: any = this.playlistForm.value;
    return entries.reduce((acc: any, item: any) => acc + item.duration, 0);
  }

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
