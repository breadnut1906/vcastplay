import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Pagination, SelectOption } from '../../shared/interfaces/general';
import { MenuItem } from 'primeng/api';
import { environment } from '../../../environments/environment.development';
import { StorageService } from '../../core/services/storage.service';
import { UtilityService } from '../../core/services/utility.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Screen, ScreenMessage } from './screen';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  api: string = environment.api;
  storage = inject(StorageService);
  utils = inject(UtilityService);
  http = inject(HttpClient);

  formBuilder = inject(FormBuilder);
  isEditMode = signal<boolean>(false);

  private screenSignal = signal<Screen[]>([]);
  screens = computed(() => this.screenSignal());

  selectionContent = signal<any>(null);

  loadingSignal = signal<boolean>(false);
  loadingAddressSignal = signal<boolean>(false);

  showDownload = signal<boolean>(false);
  showOTP = signal<boolean>(false);
  toggleControls = signal<boolean>(false);

  selectedScreen = signal<Screen | any>(null);
  // selectMultipleScreens = signal<Screen[]>([]);

  contentType = signal<string>('asset');
  selectedContentForm: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, [ Validators.required]),
    type: new FormControl(null),
  })
  
  settingsForm = this.formBuilder.group({
    display: [true],
    audio: [true],
    alwaysOnTop: [true],
    fullscreen: [true],
    syncTime: [true],
    playbackLogging: [false],
    mainDisplay: [''],
    width: [640],
    height: [480],
    left: [0],
    top: [0],
  })
  
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
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
    uniqueId: new FormControl(null),
    name: new FormControl(null, [ Validators.required ]),
    type: new FormControl(null, [ Validators.required ]),
    country: new FormControl('Philippines', [ Validators.required ]),
    region: new FormControl(null),
    city: new FormControl(null),
    fullAddress: new FormControl(null),
    latitude: new FormControl(0, { nonNullable: true }),
    longitude: new FormControl(0, { nonNullable: true }),
    zipCode: new FormControl(null),
    groupId: new FormControl(null, [ Validators.required ]),
    subGroupId: new FormControl(null, [ Validators.required ]),
    orientation: new FormControl(null),
    resolution: new FormControl(null),
    isAllDay: new FormControl<boolean>(true, { nonNullable: true }),
    isAllWeekdays: new FormControl<boolean>(false, { nonNullable: true }),
    weekdays: new FormControl<string[]>([], { nonNullable: true }),
    hours: new FormControl<{ id: number, start: Date, end: Date }[]>([], { nonNullable: true }),
    location: new FormControl(null),
    landmark: new FormControl(null),
    tags: new FormControl([], { nonNullable: true }),
    info: new FormControl(null),
  });

  // Global Form
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

  tagControl: FormControl = new FormControl(null);
  
  onDateTimeConversions(screen: Screen) {
    return screen.hours?.map((hour: any) => ({ ...hour, start: moment(hour.start).toDate(), end: moment(hour.end).toDate() })) || [];
  }
  
  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadScreens(page: number = 1, limit: number = 10) {
    return this.utils.onGETApi(`${this.api}tenants/screens?page=${page}&limit=${limit}`)
  }

  onGetScreens() {
    if (this.screens().length === 0) this.onLoadScreens();
    return this.screens();
  }

  onGetScreenByCode(code: string) {
    return this.http.post(`${this.api}tenants/screens/register`, { code }, { headers: this.onGetHTTPHeaders() });
  }

  onGetScreenById(id: number) {
    return this.http.get(`${this.api}tenants/screens/${id}`, { headers: this.onGetHTTPHeaders() });
  }

  onGetScreenManagement(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.api}tenants/screen-management?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }

  onRefreshScreens() {
    this.screenSignal.set([]);
    this.onLoadScreens();
  }

  onRemoveTag(tag: string) {
    const tempData = this.tags?.value || [];
    this.tags?.setValue(tempData.filter((t: any) => t !== tag));
  }

  onSaveScreen(id: any, screen: Screen | any, mode: string = 'create') {
    if (mode === 'create') {
      return this.http.post(`${this.api}tenants/screens`, screen, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/screens/${id}`, screen, { headers: this.onGetHTTPHeaders() })
    }
  }

  onDeleteScreen(screen: Screen) {
    return this.http.delete(`${this.api}tenants/screens/${screen.id}`, { headers: this.onGetHTTPHeaders() });
  }

  /** Screen Controls */
  onApplyContents(deviceId: number, data: any) {    
    return this.http.post(`${this.api}tenants/screen-management/apply/${deviceId}`, data, { headers: this.onGetHTTPHeaders(), reportProgress: true, observe: 'events' });
  }

  onSendCommand(deviceId: number, data: any, command: string) {
    return this.http.post(`${this.api}tenants/screen-management/${command}/${deviceId}`, data, { headers: this.onGetHTTPHeaders(), reportProgress: true, observe: 'events' });
  }

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

  onClickOpenScreen(deviceId: number, data: any) {   
    return this.http.post(`${this.api}tenants/screen-management/open/${deviceId}`, data, { headers: this.onGetHTTPHeaders(), reportProgress: true, observe: 'events' });
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

  onAssignContents(content: any) {
    /**Call POST assign contents API */
    console.log('Assign contents', content);
  }

  get tags() { return this.screenForm.get('tags'); }
}
