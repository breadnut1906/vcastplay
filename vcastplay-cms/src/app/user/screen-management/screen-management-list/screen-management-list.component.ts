import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import _ from 'lodash';
import { Screen, ScreenMessage } from '../../screens/screen';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { Pagination } from '../../../shared/interfaces/general';

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

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  isLoading = signal<boolean>(false);
  showBroadcast = signal<boolean>(false);
  showSettings = signal<boolean>(false);
  showScreenDetails = signal<boolean>(false);
  screens = signal<any[]>([]);
  selectedScreen = signal<Screen | null>(null);
  selectMultipleScreens = signal<Screen[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });

  ngOnInit() {
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
    switch (event) {
      case 'broadcast': this.showBroadcast.set(true); break;
      case 'settings': this.showSettings.set(true); break;
    }
  }

  onBroadCastMessage(event: any) {
    console.log(event);
  //   const messageArr: ScreenMessage[] = this.selectedArrScreenBroadcastMessage();
  //   if (messageArr.length == 0) return;
  //   this.screenService.onBroadCastMessage(messageArr);
  //   this.message.add({ severity:'success', summary: 'Success', detail: 'Broadcast message sent successfully!' });
  //   this.showBroadcast.set(false);
  //   this.selectedArrScreenBroadcastMessage.set([]);
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.screenService.onGetScreenManagement(pageNumber, event.rows);
  }

  onSettingsChange(event: any) {
    this.message.add({ severity:'success', summary: 'Success', detail: 'Settings applied successfully!' });
    this.showSettings.set(false);
  }

  onClickApplyContents() {
    this.message.add({ severity:'success', summary: 'Success', detail: 'Contents applied successfully!' });
  }

  onClickOpenDetails(screen: Screen) {
    this.selectedScreen.set(screen);
    this.showScreenDetails.set(true);
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
}
