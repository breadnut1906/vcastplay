import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import moment, { weekdays } from 'moment-timezone';
import { AssetsService } from '../assets/assets.service';
import { PlaylistService } from '../playlist/playlist.service';
import { SelectOption } from '../../shared/interfaces/general';
import _ from 'lodash';
import { DesignLayoutService } from '../design-layout/design-layout.service';
import { ContentItems, Schedule, ScheduleContentItems } from './schedules';
import { Assets } from '../assets/assets';
import { Playlist } from '../playlist/playlist';
import { DesignLayout } from '../design-layout/design-layout';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  designlayoutService = inject(DesignLayoutService);

  private scheduleSignal = signal<Schedule[]>([]);
  schedules = computed(() => this.scheduleSignal());

  selectedSchedule = signal<Schedule | null>(null);

  selectedContent = signal<any>(null);
  arrSelectedContents = signal<any[]>([]);
  contentSignal = signal<string>('asset');
  contentTypes = signal<any[]>([
    { label: 'Asset', value: 'asset' },
    { label: 'Playlist', value: 'playlist' },
    { label: 'Design Layout', value: 'design' },
    { label: 'Schdules', value: 'schedule' },
    { label: 'Clipart', value: 'clipart' },
  ]);
  
  calendarTitle = signal<string>('');
  calendarDateRange = signal<{ start: Date, end: Date } | null>(null);
  calendarViewSignal = signal<string>('timeGridWeek');
  calendarViews = signal<any[]>([
    { label: 'Day', value: 'timeGridDay' },
    { label: 'Week', value: 'timeGridWeek' },
    { label: 'Month', value: 'dayGridMonth' },
  ]);

  calendarSelectedDate = signal<any>(null);

  timeSlotSignal = signal<string>('00:00 - 00:15');

  loadingSignal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  showAddContents = signal<boolean>(false);
  showFillerContents = signal<boolean>(false);
  showPreviewEvent = signal<boolean>(false);
  timeValues = signal<string[]>([]);

  first = signal<number>(0);
  rows = signal<number>(8);
  totalRecords = signal<number>(0);

  scheduleStatus = signal<SelectOption[]>([
    { label: 'Approved', value: 'approved' },
    { label: 'Disapproved', value: 'disapproved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Expiring', value: 'expiring' },
    { label: 'Expired', value: 'expired' },
  ])

  scheduleForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
    type: new FormControl('schedule', { nonNullable: true }),
    startDate: new FormControl(null),
    endDate: new FormControl(null),
    contents: new FormControl<ContentItems[]>([], { nonNullable: true, validators: Validators.required }),
    status: new FormControl(null),
    approvedInfo: new FormGroup({
      approvedBy: new FormControl('Admin', { nonNullable: true }),
      approvedOn: new FormControl(new Date()),
      remarks: new FormControl(null),
    }),
  })

  contentItemForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    content: new FormControl<Assets | Playlist | DesignLayout | any>(null, [ Validators.required ]),
    start: new FormControl(null, [ Validators.required ]),
    end: new FormControl(null, [ Validators.required ]),
    allDay: new FormControl<boolean>(false, { nonNullable: true }),
    allWeekdays: new FormControl<boolean>(false, { nonNullable: true }),
    weekdays: new FormControl<string[]>([], { nonNullable: true }),
    hours: new FormControl<string[]>([], { nonNullable: true }),
    isFiller: new FormControl<boolean>(false, { nonNullable: true }),
    color: new FormControl(null, [ Validators.required ]),
  }, { validators: this.onDateRangeValidator })


  scheduleFilterForm: FormGroup = new FormGroup({
    dateRange: new FormControl(null),
    status: new FormControl(null),
    keywords: new FormControl(null),
  });

  onDateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('start')?.value;
    const end = group.get('end')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { startAfterEnd: true }
    }
    return null;
  }
  
  onPageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  onLoadSchedules() {
    /**Call GET API */
    // this.scheduleSignal.set([])
    // this.totalRecords.set(this.schedules().length);
  }

  onGetSchedule() {
    if (this.scheduleSignal().length == 0) this.onLoadSchedules();
    return this.scheduleSignal();
  }

  async onSaveContent(contentItem: ContentItems, fullCalendar: FullCalendarComponent) {    
    return new Promise((resolve, reject) => {
      try {
        let events: any[] = [];
        const calendarApi = fullCalendar.getApi();
        const startDate = moment(contentItem.start).toDate();
        const endDate = moment(contentItem.end).toDate();

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const getWeekday = moment(currentDate).format('dddd');
          if (contentItem.weekdays.includes(getWeekday)) {
            const nextDay = moment(currentDate).add(1, 'days').toDate();
            for (const hour of contentItem.hours) {

              if (moment(hour).isSameOrAfter(nextDay)) break;

              const { start: startTime, end: endTime }: any = hour;
              const start = moment(currentDate).tz('Asia/Manila').format('YYYY-MM-DD') + 'T' + moment(startTime).tz('Asia/Manila').format('HH:mm:ss');
              const end = moment(currentDate).tz('Asia/Manila').format('YYYY-MM-DD') + 'T' + moment(endTime).tz('Asia/Manila').format('HH:mm:ss');
              
              // Insert event to calendar
              const eventData = this.onAddEventToCalendar(contentItem, start, end, fullCalendar);
              calendarApi.addEvent(eventData);
              events.push(eventData);
            }
          }

          if (contentItem.allDay) {
            const start = moment(currentDate).startOf('day').toISOString();
            const end = moment(currentDate).endOf('day').toISOString();
            
            // Insert event to calendar
            const eventData = this.onAddEventToCalendar(contentItem, start, end, fullCalendar);
            calendarApi.addEvent(eventData);
            events.push(eventData);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
        resolve(events);
      } catch (error) {
        reject(error);
      }
    })
  }

  onAddEventToCalendar(contentItem: any, start: any, end: any, fullCalendar: FullCalendarComponent) {
    const calendarApi = fullCalendar.getApi();
    // Insert event to calendar
    return {
      id: (calendarApi.getEvents().length + 1).toString(),
      title: contentItem.content.name,
      start,
      end,
      backgroundColor: contentItem.color,
      borderColor: contentItem.color,
      extendedProps: contentItem.content,
      allDay: contentItem.allDay
    }
  }

  onUpdateContent(event: any) {
    const { contents } = this.scheduleForm.value;
    const { id, title, start, end, backgroundColor, borderColor, extendedProps, allDay } = event;
    
    const index = contents.findIndex((item: any) => item.id == id);
    contents[index] = { id, title, start: moment(start).toISOString(), end: moment(end).toISOString(), backgroundColor, borderColor, extendedProps, allDay };
    this.scheduleForm.patchValue({ contents });
  }

  onGetContentDetails(id: any, type: string, eventId: string) {
    switch (type) {
      case 'playlist':
        const playlist = this.playlistService.onGetPlaylists().find(item => item.id == id);
        if (playlist) {
          this.playlistService.playListForm.patchValue(playlist);
          this.selectedContent.set({ ...playlist, eventId });
        }
        break;
      case 'design':
        const design = this.designlayoutService.onGetDesigns().find(item => item.id == id);
        if (design) this.selectedContent.set({ ...design, eventId });
        break;
      default:
        const asset = this.assetService.onGetAssets().find(item => item.code == id);
        if (asset) this.selectedContent.set({ ...asset, eventId });
        break;
    }    
  }

  onDeleteContent(event: any, fullcalendar: FullCalendarComponent) {
    const calendar: any = fullcalendar.getApi();
    const { contents } = this.scheduleForm.value;  
    this.scheduleForm.patchValue({ contents: contents.filter((item: any) => item.id != event.id) });
    calendar.getEventById(event.id).remove();
  }
  
  onGetTotalContentsByType(contentItems: ScheduleContentItems[]) {
    return new Promise((resolve, reject) => {
      try {
        const totals: Record<string, number> = {};
        const contents = contentItems.filter((item: ScheduleContentItems) => !item.isFiller).map((data: ScheduleContentItems) => data.extendedProps);
        for (const content of contents) {
          const type = content.type;
          totals[type] = (totals[type] || 0) + 1;
        }
        resolve(totals);
      } catch (error) {
        reject(error);
      }
    })
  }

  onSaveSchedule(schedule: Schedule) {
    const tempData = this.schedules();
    const { id, status, ...info } = schedule;
    const index = tempData.findIndex(item => item.id == schedule.id);

    const startDate = moment.min(schedule.contents.map(item => moment(item.start)));
    const endDate = moment.max(schedule.contents.map(item => moment(item.end)));

    if (index !== -1) tempData[index] = { ...schedule, startDate: startDate.toISOString(), endDate: endDate.toISOString(), updatedOn: new Date() };
    else tempData.push({ id: tempData.length + 1, status: 'pending', ...info, 
      startDate: startDate.toISOString(), endDate: endDate.toISOString(),
      createdOn: new Date(), updatedOn: new Date(), approvedInfo: { approvedBy: '', approvedOn: null, remarks: '' } });

    this.scheduleSignal.set([ ...tempData ]);
    this.totalRecords.set(this.schedules().length);
    /**Call POST/PATCH API */
  }

  onDeleteSchedule(schedule: Schedule) {
    const tempAssets = this.scheduleSignal().filter(u => u.id !== schedule.id);
    this.scheduleSignal.set([...tempAssets]);
    this.totalRecords.set(this.schedules().length);
    /**Call DELETE API */
  }

  onDuplicateSchedule(schedule: Schedule) {
    const tempData = this.schedules();
    tempData.push({ ...schedule, id: tempData.length + 1, name: `Copy of ${schedule.name}`, approvedInfo: { approvedBy: '', approvedOn: null, remarks: '' },
      status: 'pending', createdOn: new Date(), updatedOn: new Date() });
    this.scheduleSignal.set([...tempData]);
    
    this.totalRecords.set(this.schedules().length);
    /**CALL POST API */
  }

  onApproveSchedule(schedule: Schedule, status: string) {
    const tempData = this.schedules();
    const index = tempData.findIndex(item => item.id == schedule.id);
    tempData[index] = { ...schedule, status, updatedOn: new Date() };
    this.scheduleSignal.set([...tempData]);
    
    this.totalRecords.set(this.schedules().length);
    /**CALL PATCH API */
  }

}
