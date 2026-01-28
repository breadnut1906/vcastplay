import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import _ from 'lodash';
import { Screen, ScreenItems, ScreenMessage } from '../../screens/screen';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { Pagination } from '../../../shared/interfaces/general';
import { WebsocketService } from '../../../core/services/websocket.service';
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-screen-management-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './screen-management-list.component.html',
  styleUrl: './screen-management-list.component.scss',
})
export class ScreenManagementListComponent {

  pageInfo: MenuItem = [ {label: 'Screens'}, {label: 'Management'} ];

  screenService = inject(ScreenService);
  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);
  storage = inject(StorageService);
  webSocket = inject(WebsocketService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  publicApi: string = environment.public;

  isLoading = signal<boolean>(false);
  showScreenDetails = signal<boolean>(false);
  showHealthCheck = signal<boolean>(false);
  screenHealth = signal<any>(null);
  screens = signal<any[]>([]);
  selectedScreen = signal<Screen | null>(null);
  selectMultipleScreens = signal<Screen[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });

  showScreenshot = signal<boolean>(false);
  screenShotData = signal<any>({
    deviceId: 0,
    fileName: '',
    loading: false,
  });

  constructor() {}   
  

  ngOnInit() {
    this.socketClient.on('screen:errors', (data: any) => {
      console.log('screen:errors', data);
    });

    this.socketClient.on('screen:status', (data: any) => {
      const status = data.status;
      const screens = this.selectMultipleScreens().filter(screen => screen.id !== data.deviceId);
      this.selectMultipleScreens.set(screens);
      
      this.onUpdateScreenStatus({
        ...data, 
        displayStatus: status == 'connected' ? 'on' : 'off', 
        response: status == 'connected' ? 'Player connected' : 'Player disconnected'
      });
    });

    this.socketClient.on('screen:display-status', (data: any) => this.onUpdateScreenStatus({ displayStatus: data.status}));

    this.socketClient.on('screen:response', (data: any) => this.onUpdateScreenStatus(data));

    this.socketClient.on('screen:clear', (data: any) => this.onClearScreenContent(data));

    this.socketClient.on('screen:screenshot-received', (data: any) => {
      this.screenShotData.update(current => ({ ...data, loading: false }));
    });
    
    this.onInitializedScreens();
  }

  ngOnDestroy() { }

  onInitializedScreens(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.screenService.onGetScreenManagement(page, limit).subscribe({
      next: (res: any) => {
        const { items, meta } = res;
        this.screens.set(items);
        this.pagination.set(meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    });
  }

  isAllChecked(): boolean {
    return this.selectMultipleScreens().length == this.screens().length;
  }

  onClickCheckAll(checked: boolean) {
    checked ? this.selectMultipleScreens.set(this.screens()) : this.selectMultipleScreens.set([]);
  }

  onFilterChange(event: any) { }

  onScreenControlChange(event: any) {
    switch (event.type) {
      // case 'broadcast': this.showBroadcast.set(true); break;
      // case 'settings': this.showSettings.set(true); break;
      // apply contents to selected screens
      case 'apply':
        this.onUpdateScreens(event.data);
        break;
    }
  }

  onUpdateScreens(screenItems: ScreenItems[]) {
    screenItems.forEach((item: ScreenItems) => {
      const index = this.screens().findIndex(screen => screen.id == item.id);
      if (index !== -1) this.screens()[index] = { ...this.screens()[index], content: item.content };
    })
  }

  onUpdateScreenStatus(data: any) {
    const id = data.deviceId;    
    const index = this.screens().findIndex(screen => screen.id == id);    
    if (index !== -1) this.screens()[index] = { ...this.screens()[index], ...data };
    this.screens.set([...this.screens()]);
  }

  onClearScreenContent(data: any) {
    const id = data.deviceId;    
    const index = this.screens().findIndex(screen => screen.id == id);    
    if (index !== -1) this.screens()[index] = { ...this.screens()[index], content: null };
    this.screens.set([...this.screens()]);
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializedScreens(pageNumber, event.rows);
  }

  // onSettingsChange(event: any) {
  //   this.message.add({ severity:'success', summary: 'Success', detail: 'Settings applied successfully!' });
  //   this.showSettings.set(false);
  // }

  isDisconnected(screen: Screen | any): boolean {
    return ['disconnected'].includes(screen.status) || !screen.status;
  }

  isWebPlayer(screen: Screen | any): boolean {
    return ['web'].includes(screen.type);
  }

  onClickApplyContents() {
    this.message.add({ severity:'success', summary: 'Success', detail: 'Contents applied successfully!' });
  }

  onClickOpenDetails(screen: Screen) {
    this.selectedScreen.set(screen);
    this.showScreenDetails.set(true);
  }

  onClickScreenshot(screen: Screen) {
    this.showScreenshot.set(true);
    this.screenShotData.update(current => ({ ...current, deviceId: screen.id, loading: true }));
    this.screenService.onSendCommand(screen.id, screen, 'screenshot').subscribe({
      next: () => { },
    });
  }

  onHealthCheck(screen: Screen) {
    this.selectedScreen.set(screen);
    this.showHealthCheck.set(true);
  }

  onHidePreview() {
    this.screenShotData.update(current => ({ ...current, fileName: '', loading: false }));
  }

  get isMobile() { return this.utils.isMobile(); }
  get isTablet() { return this.utils.isTablet(); }

  get screenFilterForm() { return this.screenService.screenFilterForm; }
  get selectedArrScreenBroadcastMessage() { return this.broadcastService.selectedArrScreenBroadcastMessage; }

  get legend() {
    const totalPlaying = this.screens().filter(screen => screen.status == 'playing').length;
    const totalDisconnected = this.screens().filter(screen => screen.status == 'disconnect').length;
    const totalStandby = this.screens().filter(screen => screen.status == 'standby').length;
    const totalApproved = this.screens().filter(screen => screen.approvalStatus == 'approved').length;
    const totalDisapproved = this.screens().filter(screen => screen.approvalStatus == 'disapproved').length;

    return { totalPlaying, totalDisconnected, totalStandby, totalApproved, totalDisapproved };
  }

  get isSelecAll() {
    return this.selectMultipleScreens().length == this.screens().length;
  }

  get hasSelectedScreens() {
    return this.selectMultipleScreens().length > 0;
  }

  get isCheckIndeterminate() {
    return this.selectMultipleScreens().length > 0 && this.selectMultipleScreens().length < this.screens().length;
  }

  get selectedScreens() {
    return this.selectMultipleScreens().filter(screen => ['connected'].includes(screen.status));
  }

  get socketClient() {
    return this.webSocket.socketClient;
  }

  get tenantId() {
    return this.storage.get('id');
  }

  get screenshot() {
    return this.screenShotData();
  }

  get paginate() {
    return this.pagination();
  }
}
