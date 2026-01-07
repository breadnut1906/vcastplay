import { Component, inject, Input } from '@angular/core';
import { SchedulesService } from '../schedules.service';
import { WEEKDAYS } from '../../../shared/interfaces/general';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-schedule-hour-list',
  imports: [ PrimengUiModule ],
  templateUrl: './schedule-hour-list.component.html',
  styleUrl: './schedule-hour-list.component.scss'
})
export class ScheduleHourListComponent {

  @Input() contentItemForm!: FormGroup;
  @Input() dateRange!: { start: Date; end: Date };

  scheduleService = inject(SchedulesService);
  message = inject(MessageService);
  weekdays: string[] = WEEKDAYS;
  
  onClickAddHours() {
    const hourValue = this.hoursControl?.value;
    const hoursTotal = this.hoursControl?.value.length;
    let nextStart = hourValue.length === 0 ? moment().startOf('hour').toDate() : moment(hourValue[hourValue.length - 1].end).toDate();
    let nextEnd = moment(nextStart).add(1, 'hour').toDate();
    while (hourValue.some((hour: any) => hour.start.getTime() === nextStart.getTime() && hour.end.getTime() === nextEnd.getTime())) {
      nextStart = moment(nextStart).toDate();
      nextEnd = moment(nextStart).add(1, 'hour').toDate();
    }
    const hour = { id: hoursTotal + 1, start: nextStart, end: nextEnd }
    this.hoursControl?.patchValue([...hourValue, hour]);
  }
  
  onClickDeleteHour(item: any) {    
    const { id } = item;
    const hours = this.hoursControl?.value;
    this.hoursControl?.patchValue(hours.filter((hour: any) => hour.id !== id));
  }

  onAlwaysOnChange(event: any) {
    this.contentItemForm.get('hours')?.reset();
    this.contentItemForm.get('weekdays')?.reset();
  }
  
  onCheckAllWeekdays(event: any) {
    const checked = event.checked;
    if (checked) {
      this.weekdaysControl?.patchValue(WEEKDAYS);
    } else {
      this.weekdaysControl?.reset();
    }
  }

  onTimeChange(index: number) {
    const hours = this.hoursControl?.value;
    const hour = hours[index];

    if (hour.start > hour.end) {
      this.message.add({
        severity: 'error', summary: 'Invalid time range', detail: `Row ${index + 1}: Start time cannot be after end time`
      });
      hour.start = moment(hour.end).subtract(1, 'hour').toDate();
      hour.end = moment(hour.start).add(1, 'hour').toDate();
    }
  }
  
  isCheckedWeekday(): boolean {
    const weekdaysCtrl = this.weekdaysControl?.value;
    return weekdaysCtrl?.length > 0 && weekdaysCtrl.length < this.weekdays.length;
  }

  get allDay() { return this.contentItemForm.get('allDay')?.value; }
  get allWeekdays() { return this.contentItemForm.get('allWeekdays')?.value; }
  get weekdaysControl() { return this.contentItemForm.get('weekdays'); }
  get hoursControl() { return this.contentItemForm.get('hours'); }
}
