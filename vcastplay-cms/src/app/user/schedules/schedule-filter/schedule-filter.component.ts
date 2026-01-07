import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { SchedulesService } from '../schedules.service';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

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

  get scheduleStatus() { return this.scheduleService.scheduleStatus; }
  get scheduleFilterForm() { return this.scheduleService.scheduleFilterForm; }
}
