import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import moment from 'moment';
import { WEEKDAYS } from '../../interfaces/general';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-weekday-hour-selection',
  imports: [ PrimengUiModule, CommonModule ],
  templateUrl: './weekday-hour-selection.component.html',
  styleUrl: './weekday-hour-selection.component.scss'
})
export class WeekdayHourSelectionComponent {

  @Input() formGroup!: FormGroup;
  @Input() dateRange!: { start: Date; end: Date };

  @Input() isDisabled: boolean = false;
  @Input() showAllDay: boolean = false;

  @Input() allDayLabel: string = 'All Day';
  
  message = inject(MessageService);
  weekdays: string[] = WEEKDAYS;

  ngOnInit() { }

  onClickAddHours() {    
    const hourValue = this.hoursControl?.value ?? [];
    const hoursTotal = this.hoursControl?.value?.length ?? 0;
    let nextStart = (hourValue.length === 0 ? moment().startOf('hour') : moment(hourValue[hourValue.length - 1].end)).toDate();
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
    this.formGroup.get('hours')?.reset();
    this.formGroup.get('weekdays')?.reset();
    this.formGroup.get('isAllWeekdays')?.reset();
  }

  onWeekdayChange(event: any) {
    const weekdays = this.weekdaysControl?.value;
    this.formGroup.patchValue({ isAllWeekdays: (weekdays.length) >= 7 });
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

  get isAllDay() { return this.formGroup.get('isAllDay')?.value; }
  get isAllWeekdays() { return this.formGroup.get('isAllWeekdays')?.value; }
  get weekdaysControl() { return this.formGroup.get('weekdays'); }
  get hoursControl() { return this.formGroup.get('hours') as FormControl; }
}
