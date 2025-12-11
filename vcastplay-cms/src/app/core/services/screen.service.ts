import { computed, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Screen, ScreenMessage } from '../../features/screens/screen';
import { SelectOption } from '../interfaces/general';
import { MenuItem } from 'primeng/api';
import { environment } from '../../../environments/environment.development';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  api: string = environment.api;
  storage = inject(StorageService);
  utils = inject(UtilityService);

  isEditMode = signal<boolean>(false);

  private screenSignal = signal<Screen[]>([]);
  screens = computed(() => this.screenSignal());

  selectionContent = signal<any>(null);

  loadingSignal = signal<boolean>(false);
  loadingAddressSignal = signal<boolean>(false);

  showDownload = signal<boolean>(false);
  showOTP = signal<boolean>(false);
  showBroadcast = signal<boolean>(false);
  toggleControls = signal<boolean>(false);
  showSettings = signal<boolean>(false);
  showContents = signal<boolean>(false);
  showScreenDetails = signal<boolean>(false);

  selectedScreen = signal<Screen | null>(null);
  selectMultipleScreens = signal<Screen[]>([]);

  contentType = signal<string>('asset');
  selectedContentForm: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, [ Validators.required]),
    type: new FormControl(null),
  })
  
  rows = signal<number>(8);
  totalRecords = signal<number>(0);

  types = signal<SelectOption[]>([
    { label: 'Desktop', value: 'desktop' },
    { label: 'Android', value: 'android' },
    { label: 'Web', value: 'web' },
  ]);

  screenStatus = signal<SelectOption[]>([
    { label: 'Playing', value: 'playing' },
    { label: 'Standby', value: 'Standby' },
    { label: 'Disconnected', value: 'disconnected' },
  ]);
  
  contentStatus = signal<SelectOption[]>([
    { label: 'Approved', value: 'approved' },
    { label: 'Disapproved', value: 'disapproved' },
    { label: 'Pending', value: 'pending' },
  ])

  locations = signal<SelectOption[]>([
    { label: 'Local', value: 'local' },
    { label: 'Global', value: 'global' },
    { label: 'National', value: 'national' },
    { label: 'International', value: 'iInternational' },
    { label: 'Regional', value: 'regional' },
  ]);

  landmarks = signal<SelectOption[]>([
    { label: 'Mountains', value: 'mountains' },
    { label: 'Rivers', value: 'rivers' },
    { label: 'Ancient Ruins', value: 'ancient Ruins' },
    { label: 'Castles', value: 'castles' },
    { label: 'Skyscrapers', value: 'skyscrapers' },
  ]);

  toggleOptions: MenuItem[] = [{ label: 'On', value: true, },{ label: 'Off', value: false }];

  screenForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    code: new FormControl(null, { length: 6, validators: Validators.required }),
    name: new FormControl(null, [ Validators.required ]),
    type: new FormControl(null, [ Validators.required ]),
    address: new FormGroup({
      country: new FormControl('Philippines', [ Validators.required ]),
      region: new FormControl(null),
      city: new FormControl(null),
      fullAddress: new FormControl(null),
      latitude: new FormControl(0, { nonNullable: true }),
      longitude: new FormControl(0, { nonNullable: true }),
      zipCode: new FormControl(null),
    }),
    group: new FormControl(null, [ Validators.required ]),
    subGroup: new FormControl(null, [ Validators.required ]),
    displaySettings: new FormGroup({
      orientation: new FormControl(null, [ Validators.required ]),
      resolution: new FormControl(null, [ Validators.required ]),
    }),
    allDay: new FormControl<boolean>(false, { nonNullable: true }),
    allWeekdays: new FormControl<boolean>(false, { nonNullable: true }),
    weekdays: new FormControl<string[]>([], { nonNullable: true }),
    hours: new FormControl<string[]>([], { nonNullable: true }),
    geograhic: new FormGroup({
      locations: new FormControl(null, [ Validators.required ]),
      landmarks: new FormControl(null, [ Validators.required ]),
    }),
    tags: new FormControl([], { nonNullable: true }),
    screenStatus: new FormControl(null),
    displayStatus: new FormControl(null),
    registeredOn: new FormControl(null),
  });

  screenFilterForm: FormGroup = new FormGroup({
    dateRange: new FormControl(null),
    type: new FormControl(null),
    group: new FormControl(null),
    subGroup: new FormControl(null),
    orientation: new FormControl(null),
    status: new FormControl(null),
    location: new FormControl(null),
    screenStatus: new FormControl(null),
    contentStatus: new FormControl(null),
    keywords: new FormControl(null),
  });

  screenConfigForm: FormGroup = new FormGroup({
    display: new FormControl(false),
    audio: new FormControl(false),
    alwaysTop: new FormControl(false),
    fullscreen: new FormControl(false),
    syncTime: new FormControl(false),
    playbackLogging: new FormControl(false),
  })

  tagControl: FormControl = new FormControl(null);

  onLoadScreens() {
    this.utils.onGETApi(`${this.api}tenants/screens`).subscribe((res: any) => {
      const { items, meta } = res;
      this.screenSignal.set(items);
      this.totalRecords.set(meta.totalItems);
    })
  }

  onGetScreens() {
    if (this.screens().length === 0) this.onLoadScreens();
    return this.screens();
  }

  onGetScreenByCode(code: string) {
    /**Call GET screen by code or id API */
    return new Promise((resolve, reject) => {
      const screen = this.screens().find(s => s.code === code);
      if (screen) resolve(screen);
    })
  }

  onRefreshScreens() {
    this.screenSignal.set([]);
    this.onLoadScreens();
  }

  onRemoveTag(tag: string) {
    const tempData = this.tags?.value || [];
    this.tags?.setValue(tempData.filter((t: any) => t !== tag));
  }

  onSaveScreen(screen: Screen) {
    /**Call POST/PATCH role API */
    const tempScreens = this.screens();
    const { id, code, status, ...info } = screen;
    const index = tempScreens.findIndex(s => s.id === id);
    if (index !== -1) tempScreens[index] = { ...tempScreens[index], ...info, status: 'active', registeredOn: new Date(), updatedOn: new Date() };
    else tempScreens.push({ id: tempScreens.length + 1, code: `NYX00${tempScreens.length + 1}`, status: 'inactive', ...info, createdOn: new Date(), updatedOn: new Date() });

    this.screenSignal.set([...tempScreens]);

    this.totalRecords.set(this.screens().length);
  }

  onDeleteScreen(screen: Screen) {
    /**Call DELETE role API */
    const tempScreens = this.screens().filter(s => s.id !== screen.id);
    this.screenSignal.set([...tempScreens]);

    this.totalRecords.set(this.screens().length);
  }

  /** Screen Controls */
  onDisplayScreen() {
    /**Call POST display screen API */
    console.log('Display screen');
  }

  onToggleAudio(value: boolean) {
    /**Call POST toggle audio API */
    console.log('Toggle audio', value); 
  }

  onToggleFullscreen(value: boolean) {
    /**Call POST toggle fullscreen API */
    console.log('Toggle fullscreen', value); 
  }

  onSyncTime() {
    /**Call POST sync time API */
    console.log('Sync time'); 
  }

  onGetPlaybackContentLogs(value: boolean) {
    /**Call POST playback content API */
    console.log('Playback content', value); 
  }

  onClickClear(value: boolean) {
    /**Call POST clear API */
    console.log('Clear All / Reset', value); 
  }

  onClickOpenScreen() {
    /**Call POST open screen API */
    console.log('Open screen');
  }

  onCloseScreen() {
    /**Call POST close screen API */
    console.log('Close screen');
  }

  onRestartScreen() {
    /**Call POST restart API */
    console.log('Restart screen');
  }

  onShutdownScreen() {
    /**Call POST shutdown API */
    console.log('Shutdown screen');
  }

  onBroadCastMessage(messages: ScreenMessage[]) {
    /**Call POST broadcast message API */
    console.log('Broadcast message', messages);
  }

  onAssignContents() {
    /**Call POST assign contents API */
    console.log('Assign contents', this.selectMultipleScreens());
  }

  get tags() { return this.screenForm.get('tags'); }
}
