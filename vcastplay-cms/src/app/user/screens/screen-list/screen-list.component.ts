import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ScreenService } from '../screen.service';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { UtilityService } from '../../../core/services/utility.service';
import { Router } from '@angular/router';
import _ from  'lodash';

@Component({
  selector: 'app-screen-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './screen-list.component.html',
  styleUrl: './screen-list.component.scss',
})
export class ScreenListComponent {

  pageInfo: MenuItem = [ {label: 'Screens'}, {label: 'Registration'} ];

  screenService = inject(ScreenService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);

  isVerifyOTP = signal<boolean>(false);
  isShowInfo = signal<boolean>(false);
  screenFilters = signal<any>(this.screenFilterForm.valueChanges)
  filteredScreen = computed(() => {
    const { type, group, subGroup, orientation, status, keywords } = this.screenFilters();
    const screens = this.screenService.screens();

    return screens.filter((screen: any) => {
      const matchesType = !type || screen.type.includes(type);
      const matchesGroup = !group || screen.group?.includes(group);
      const matchesSubGroup = !subGroup || screen.subGroup?.includes(subGroup);
      const matchesOrientation = !orientation || screen.displaySettings.orientation?.includes(orientation);
      const matchesStatus = !status || (screen.status == status);
      const matchesKeywords = !keywords || _.includes(screen.name.toLowerCase(), keywords.toLowerCase()) || _.includes(screen.code, keywords);

      return matchesType && matchesGroup && matchesSubGroup && matchesOrientation && matchesStatus && matchesKeywords;
    })
  });

  ngOnInit() {
    this.screenService.onLoadScreens();
  }

  onClickEdit(item: any) {
    this.isEditMode.set(true);
    this.router.navigate([ '/screens/screen-details' ], { queryParams: { id: item.id } });
  }

  onClickView(item: any) {
    this.isShowInfo.set(true);
    this.selectedScreen.set(item);
  }

  onClickDelete(item: any, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this screen?',
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
        this.screenService.onDeleteScreen(item).subscribe({
          next: (res: any) => {
            this.message.add({ severity:'success', summary: 'Success', detail: 'Screen deleted successfully!' });
          },
          error: (err: any) => {
            this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to delete screen!' });
          },
          complete: () => {
            this.screenService.onLoadScreens();
          }
        });
      },
      reject: () => { }
    })
  }

  onClickRefresh() { }

  onClickVerify() {
    this.isVerifyOTP.set(true);
    const { code } = this.screenForm.value;
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      this.screenService.onGetScreenByCode(code).subscribe({
        next: (res: any) => {
          this.selectedScreen.set({ ...res, latitude, longitude });
          this.router.navigate([ '/screens/screen-details' ], { queryParams: { id: res.id } });
        },
        error: (err: any) => {
          this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to verify screen code!' });
        },
        complete: () => {
          this.showOTP.set(false);
          this.isVerifyOTP.set(false);
        }
      })
    });
  }

  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.screenService.onLoadScreens(pageNumber, event.rows);
  }

  onFilterChange(event: any) {
    this.screenFilters.set(event.filters);
  }

  formControl(fieldName: string) { return this.utils.getFormControl(this.screenForm, fieldName); }
  
  get isMobile() { return this.utils.isMobile(); }

  get rows() { return this.screenService.rows; }
  get showOTP() { return this.screenService.showOTP; }
  get screenForm() { return this.screenService.screenForm; }
  get isEditMode() { return this.screenService.isEditMode; }
  get pagination() { return this.screenService.pagination; }
  get totalRecords() { return this.screenService.totalRecords; }
  get showDownload() { return this.screenService.showDownload; }
  get selectedScreen() { return this.screenService.selectedScreen; }
  get screenFilterForm() { return this.screenService.screenFilterForm; }
}
