import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { SchedulesService } from '../schedules.service';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { FormBuilder } from '@angular/forms';
import { SelectOption } from '../../../shared/interfaces/general';

@Component({
  selector: 'app-schedule-filter',
  imports: [ PrimengUiModule ],
  templateUrl: './schedule-filter.component.html',
  styleUrl: './schedule-filter.component.scss'
})
export class ScheduleFilterComponent {

  @Output() filterChange = new EventEmitter<any>();

  scheduleService = inject(SchedulesService);

  useFilter = signal<boolean>(false);
  
  formBuilder = inject(FormBuilder);
  scheduleFilterForm = this.formBuilder.group({
    dateRange: [null],
    status: [null],
    keywords: [null],
  })
  
  scheduleStatus = signal<SelectOption[]>([
    { label: 'Approved', value: 'approved' },
    { label: 'Disapproved', value: 'disapproved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Expiring', value: 'expiring' },
    { label: 'Expired', value: 'expired' },
  ])

  onClickApply(filter: any) {
    const filters = this.scheduleFilterForm.value;
    this.filterChange.emit({ filters });
    this.useFilter.set(true);
    filter.hide();
  }

  onClickClear(filter: any) {
    this.scheduleFilterForm.reset();
    this.filterChange.emit({ filters: this.scheduleFilterForm.value });
    this.useFilter.set(false);
    filter.hide();
  }
}
