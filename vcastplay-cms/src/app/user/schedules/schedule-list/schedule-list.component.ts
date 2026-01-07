import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { SchedulesService } from '../schedules.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Router } from '@angular/router';
import { Schedule } from '../schedules';

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
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete($event, this.selectedSchedule()) }
      ]
    }
  ];

  scheduleServices = inject(SchedulesService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);
  
  showApprove = signal<boolean>(false);
  
  scheduleFilters = signal<any>(this.scheduleFilterForm.valueChanges);
  filterSchedules = computed(() => {
    const { status, keywords } = this.scheduleFilters();
    const schedules = this.scheduleServices.schedules();
    return schedules.filter(schedule => {
      const matchStatus = !status || (schedule.status == status);
      const matchKeywords = !keywords || schedule.name.toLowerCase().includes(keywords.toLowerCase()) || schedule.description.toLowerCase().includes(keywords.toLowerCase());
      
      return matchStatus && matchKeywords;
    })
  })

  ngOnInit() {
    this.scheduleServices.onGetSchedule();
  }

  onClickAddNew() {
    this.isEditMode.set(false);
    this.router.navigate([ '/schedule/schedule-details' ]);
  }

  onClickEdit(schedule: Schedule) {
    this.isEditMode.set(true);    
    this.scheduleForm.patchValue(schedule);
    this.router.navigate([ '/schedule/schedule-details' ]);
  }

  onClickOpenOptions(event: Event, item: any, menu: any) {
    this.selectedSchedule.set(item);
    menu.toggle(event);
  }

  onClickDuplicate(event: Event, schedule: any) {
    this.scheduleServices.onDuplicateSchedule(schedule);
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
        this.scheduleServices.onDeleteSchedule(schedule);
        this.message.add({ severity:'success', summary: 'Success', detail: 'Schedule deleted successfully!' });
        this.selectedSchedule.set(null);
        this.scheduleForm.reset();
      },
      reject: () => { }
    })
  }

  onClickShowApproved(event: any, item: any, popup: any) {
    this.scheduleForm.patchValue(item);
    popup.toggle(event);
  }

  onClickConfirmApproved(event: Event, popup: any, type: string) {
    const { approvedInfo, ...info } = this.scheduleForm.value;
    if (approvedInfo.remarks === '') {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Remarks is required!' });
      return;
    }
    this.showApprove.set(false);
    this.scheduleServices.onApproveSchedule(this.scheduleForm.value, type);
    this.scheduleForm.reset();
    popup.hide();
  }

  onClickCloseApproved(event: Event, popup: any) {
    this.showApprove.set(false);
    popup.hide();
  }

  onFilterChange(event: any) {
    this.scheduleFilters.set(event.filters);
  }

  get rows() { return this.scheduleServices.rows; }
  get first() { return this.scheduleServices.first; }
  get schedules() { return this.scheduleServices.schedules; }
  get isEditMode() { return this.scheduleServices.isEditMode; }
  get scheduleForm() { return this.scheduleServices.scheduleForm; }
  get totalRecords() { return this.scheduleServices.totalRecords; }
  get selectedSchedule() { return this.scheduleServices.selectedSchedule; }
  get scheduleFilterForm() { return this.scheduleServices.scheduleFilterForm; }
  
  get status() { return this.scheduleForm.get('status'); }
  get approvedInfo() { return this.scheduleForm.get('approvedInfo'); }
}
