import { computed, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContentState, Playlist } from './playlist';
import { SelectOption } from '../../core/interfaces/general';
import { DesignLayout } from '../design-layout/design-layout';
import { Assets } from '../assets/assets';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private playlistSignal = signal<Playlist[]>([]);
  playlists = computed(() => this.playlistSignal());
  selectedPlaylist = signal<Playlist | null>(null);
  selectedArrPlaylist = signal<Playlist[]>([]);

  first = signal<number>(0);
  rows = signal<number>(8);
  totalRecords = signal<number>(0);

  loadingSignal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isPlaying = signal<boolean>(false);

  showContents = signal<boolean>(false);
  progress = signal<number>(0);
  
  filteredAssets = signal<Assets[]>([]);
  selectedAssets = signal<Assets[]>([]);
  currentPlaying = signal<Assets | DesignLayout | any>(null);
  
  playlistStatus = signal<SelectOption[]>([
    { label: 'Approved', value: 'approved' },
    { label: 'Disapproved', value: 'disapproved' },
    { label: 'Pending', value: 'pending' },
  ])

  playListTypes = signal<SelectOption[]>([
    { label: 'Manual', value: false },
    { label: 'Auto', value: true },
  ])

  playListForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
    type: new FormControl('playlist', { nonNullable: true, validators: [ Validators.required ] }),
    transition: new FormGroup({
      hasGap: new FormControl(false),
      type: new FormControl(null),
      speed: new FormControl(5, { nonNullable: true }),
    }),
    contents: new FormControl<any[]>([], { nonNullable: true }),
    status: new FormControl(null),
    loop: new FormControl(true),
    approvedInfo: new FormGroup({
      approvedBy: new FormControl('Admin'),
      approvedOn: new FormControl(new Date()),
      remarks: new FormControl(null),
    }),
    isAuto: new FormControl(false),
    isActive: new FormControl(false),
    duration: new FormControl(0),
    files: new FormControl([], { nonNullable: true }),
  })
  
  playlistFilterForm: FormGroup = new FormGroup({
    dateRange: new FormControl(null),
    status: new FormControl(null),
    isAuto: new FormControl(null),
    keywords: new FormControl(null),
  });

  categoryForm: FormGroup = new FormGroup({
    category: new FormControl(null),
    subCategory: new FormControl(null),
  })

  transitionTypes: any[] = [
    { label: 'Fade In', value: 'fade-in' },
    { label: 'Slide Up', value: 'slide-up' },
    { label: 'Slide Down', value: 'slide-down' },
    { label: 'Slide Left', value: 'slide-left' },
    { label: 'Slide Right', value: 'slide-right' },
  ]

  videoElement = signal<HTMLVideoElement | null>(null);

  activeStep = signal<number>(1);

  totalDuration = (data?: any) => {
    const contents: any[] = data ?? this.contents?.value;
    return contents.reduce((acc: any, item: any) => acc + item.duration, 0);
  }

  // for testing
  private states = new Map<number, ContentState>();
  preloadContents: { [id: string]: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement } = {};

  constructor() { }

  onLoadPlaylist() {
    this.playlistSignal.set([]);
    this.totalRecords.set(this.playlists().length);
    /**CALL GET API */
  }

  onGetPlaylists() {
    if (this.playlistSignal().length === 0) this.onLoadPlaylist();
    return this.playlistSignal();
  }

  onRefreshPlaylist() {
    this.playlistSignal.set([]);
    this.onLoadPlaylist(); 
  }

  onSaveAssetToPlaylist(asset: Assets, playlist: Playlist[]) {
    playlist.forEach(item => {
      const tempData = item.contents;
      const assetItem = item.contents.find(item => item.id === asset.id);
      if (!assetItem) {
        item.contents = [...tempData, { ...asset, contentId: item.contents.length + 1 }];
        this.onSavePlaylist(item);
      };
    })    
  }

  onSavePlaylist(playlist: Playlist) {
    const tempData = this.playlists();
    const { id, status, ...info } = playlist;
    const index = tempData.findIndex(item => item.id === playlist.id);

    if (index !== -1) tempData[index] = { ...playlist, updatedOn: new Date() };
    else tempData.push({ id: tempData.length + 1, status: 'pending', ...info, 
      createdOn: new Date(), updatedOn: new Date(), approvedInfo: { approvedBy: '', approvedOn: null, remarks: '' } });
    
    this.playlistSignal.set([...tempData]); 

    this.totalRecords.set(this.playlists().length);
    console.log(this.playlists());
    
    /**CALL POST API */
  }

  onDeletePlaylist(playlist: Playlist) {
    const tempData = this.playlists().filter(item => item.id !== playlist.id);
    this.playlistSignal.set([...tempData]);
    
    this.totalRecords.set(this.playlists().length);
    /**CALL DELETE API */
  }

  onDuplicatePlaylist(playlist: Playlist) {
    const tempData = this.playlists();
    tempData.push({ ...playlist, id: tempData.length + 1, name: `Copy of ${playlist.name}`, status: 'pending', 
      createdOn: new Date(), updatedOn: new Date(), approvedInfo: { approvedBy: '', approvedOn: null, remarks: '' } });
    this.playlistSignal.set([...tempData]);
    
    this.totalRecords.set(this.playlists().length);
    /**CALL POST API */
  }

  onApprovePlaylist(playlist: Playlist, status: string) {
    const tempData = this.playlists();
    const index = tempData.findIndex(item => item.id == playlist.id);
    tempData[index] = { ...playlist, status, updatedOn: new Date() };    
    this.playlistSignal.set([...tempData]);
    
    this.totalRecords.set(this.playlists().length);
    /**CALL POST API */
  }

  onGetContentSchedule(content: Assets) {
    // const { dateRange, weekdays, hours } = content;
    console.log(content);
  }
  
  onPageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  get contents() { return this.playListForm.get('contents'); }
  get files() { return this.playListForm.get('files'); }
  get loop() { return this.playListForm.get('loop'); }
  get transition() { return this.playListForm.get('transition'); }
}
