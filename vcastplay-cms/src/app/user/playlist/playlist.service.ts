import { computed, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContentState, Playlist } from './playlist';
import { SelectOption } from '../../shared/interfaces/general';
import { DesignLayout } from '../design-layout/design-layout';
import { Assets } from '../assets/assets';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  storage = inject(StorageService);
  http = inject(HttpClient);

  api: string = environment.api;

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
    { label: 'Fade In', value: 'fade' },
    { label: 'Slide Up', value: 'slide-up' },
    { label: 'Slide Down', value: 'slide-down' },
    { label: 'Slide Left', value: 'slide-left' },
    { label: 'Slide Right', value: 'slide-right' },
  ]

  videoElement = signal<HTMLVideoElement | null>(null);

  activeStep = signal<number>(1);

  // totalDuration = (data?: any) => {
  //   const contents: any[] = data ?? this.contents?.value;
  //   return contents.reduce((acc: any, item: any) => acc + item.duration, 0);
  // }

  // for testing
  private states = new Map<number, ContentState>();
  preloadContents: { [id: string]: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement } = {};

  constructor() { }
  
  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadPlaylist(page: number, limit: number) {
    /**CALL GET API */
    return this.http.get(`${this.api}tenants/playlists?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }

  onGetPlaylistById(id: number) {
    /**CALL GET API */
    return this.http.get(`${this.api}tenants/playlists/${id}`, { headers: this.onGetHTTPHeaders() });
  }

  onRefreshPlaylist() { }

  onSaveAssetToPlaylist(asset: Assets, playlist: Playlist[]) {
    playlist.forEach(item => {
      const tempData = item.entries;
      const assetItem = item.entries.find(item => item.id === asset.id);
      if (!assetItem) {
        item.entries = [...tempData, { ...asset, contentId: item.entries.length + 1 }];
        // this.onSavePlaylist(item);
      };
    })    
  }

  onSavePlaylist(id: number, playlist: Playlist, mode: boolean = false) {    
    /**CALL POST API */
    if (!mode) {
      return this.http.post(`${this.api}tenants/playlists`, playlist, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/playlists/${id}`, playlist, { headers: this.onGetHTTPHeaders() });
    }
  }

  onDeletePlaylist(playlist: Playlist) {
    /**CALL DELETE API */
    return this.http.delete(`${this.api}tenants/playlists/${playlist.id}`, { headers: this.onGetHTTPHeaders() });
  }

  onDuplicatePlaylist(playlist: Playlist) {
    /**CALL POST API */
  }

  onApprovePlaylist(playlist: Playlist, status: string) {
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

  get tenantId() { return this.storage.get('id'); }
}
