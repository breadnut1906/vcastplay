import { Component, computed, effect, inject, Input, signal, SimpleChanges } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { SchedulesService } from '../schedules.service';
import { FormGroup } from '@angular/forms';
import { ContentItems, Schedule } from '../schedules';
import { UtilityService } from '../../../core/services/utility.service';
import moment from 'moment';
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';

@Component({
  selector: 'app-schedule-fillers',
  imports: [ PrimengUiModule, ContentSelectionComponent ],
  templateUrl: './schedule-fillers.component.html',
  styleUrl: './schedule-fillers.component.scss'
})
export class ScheduleFillersComponent {

  @Input() scheduleForm!: FormGroup<Schedule | any>;
  @Input() showFillerContents = signal<boolean>(false);

  scheduleService = inject(SchedulesService);
  utils = inject(UtilityService);
  
  arrSelectedContents = signal<ContentItems[]>([]);

  timeSlots = computed(() => this.generateTimeCode().map((timeSlot: any) => ({ ...timeSlot, value: `${timeSlot.start} - ${timeSlot.end}`})) );
  
  readOnly = computed(() => {
    const { status } = this.scheduleForm.value;
    return ['approved', 'disapproved'].includes(status);
  })

  ngOnInit() {
    this.onAddFillers();
  }
  
  onClickSaveFillers(event: Event) {
    const { contents } = this.scheduleForm.value;    
    const fillers = this.arrSelectedContents().map((item: any) => ({
      id: item.code,
      title: item.name,
      start: this.calendarSelectedDate().start,
      end: this.calendarSelectedDate().end,
      backgroundColor: '#71717B',
      borderColor: '#71717B',
      extendedProps: item,
      allDay: true,
      isFiller: true
    }))    
    this.scheduleForm.patchValue({ contents: [ ...fillers, ...contents.filter((item: any) => !item.isFiller) ] });
    this.showFillerContents.set(false);
  }

  onAddFillers() {
    const { contents } = this.scheduleForm.value;
    const fillers = contents.filter((event: any) => event.isFiller).map((event: any) => event.extendedProps);

    const time = this.timeSlots().find(slot => slot.value == this.timeSlotSignal);
    const start = moment(this.calendarDateRange()?.start).format('YYYY-MM-DD');
    const end = moment(this.calendarDateRange()?.end).subtract(1, 'day').format('YYYY-MM-DD');    
    
    const startDateTime = moment(`${start} ${time.start}`, 'YYYY-MM-DD HH:mm:ss').toDate();
    const endDateTime = moment(`${end} ${time.end}`, 'YYYY-MM-DD HH:mm:ss').toDate();
    this.calendarSelectedDate.set({ start: startDateTime, end: endDateTime, allDay: true });
    this.arrSelectedContents.set(fillers);
  }

  onSelectionChange(event: any) {
    this.arrSelectedContents.set(event);
  }
  
  get generateTimeCode() { return this.utils.generateTimeCode; }

  get timeSlotSignal() { return this.scheduleService.timeSlotSignal(); }
  get calendarDateRange() { return this.scheduleService.calendarDateRange; }
  get calendarSelectedDate() { return this.scheduleService.calendarSelectedDate; }

}
