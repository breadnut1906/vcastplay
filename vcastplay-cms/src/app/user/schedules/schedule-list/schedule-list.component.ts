import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { SchedulesService } from '../schedules.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Router } from '@angular/router';
import { Schedule } from '../schedules';
import { Pagination } from '../../../shared/interfaces/general';

@Component({
  selector: 'app-schedule-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.scss',
})
export class ScheduleListComponent {

  pageInfo: MenuItem = [ { label: 'Schedules' }, { label: 'List' } ];
  actionItems: MenuItem[] = [
    { 
      label: 'Options',
      items: [
        { label: 'Duplicate', icon: 'pi pi-copy', command: ($event: any) => this.onClickDuplicate($event, this.selectedSchedule()) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete($event, this.selectedSchedule()), styleClass: 'delete-menu-item' }
      ]
    }
  ];

  scheduleServices = inject(SchedulesService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);
  
  schedules = signal<Schedule[]>([]);
  selectedSchedule = signal<Schedule | any>(null);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.onInititalizedSchedules();
  }

  onInititalizedSchedules(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.scheduleServices.onLoadSchedules(page, limit).subscribe({
      next: (res: any) => {
        this.schedules.set(res.items);
        this.pagination.set(res.meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    })
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInititalizedSchedules(pageNumber, event.rows);
  }

  onFilterChange(event: any) { }

  onClickAddNew() {
    this.router.navigate([ '/schedule/schedule-details' ]);
  }

  onClickEdit(schedule: Schedule) {
    this.router.navigate([ '/schedule/schedule-details' ], { queryParams: { id: schedule.id } });
  }

  onClickOpenOptions(event: Event, item: any, menu: any) {
    menu.toggle(event);
  }

  onClickDuplicate(event: Event, schedule: any) {
    this.message.add({ severity:'success', summary: 'Success', detail: 'Schedule duplicated successfully!' });
  }

  onClickDelete(event: Event, schedule: any) {
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
        this.message.add({ severity:'success', summary: 'Success', detail: 'Schedule deleted successfully!' });
      },
      reject: () => { }
    })
  }

  onClickShowApproved(event: any, item: any, popup: any) { }

  onClickConfirmApproved(event: Event, popup: any, type: string) { }

  onClickCloseApproved(event: Event, popup: any) {
    popup.hide();
  }
}
