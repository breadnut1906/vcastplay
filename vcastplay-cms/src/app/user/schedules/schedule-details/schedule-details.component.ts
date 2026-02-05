import { Component, computed, HostListener, inject, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { SchedulesService } from '../schedules.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { UtilityService } from '../../../core/services/utility.service';
import moment from 'moment-timezone';
import { PlaylistService } from '../../playlist/playlist.service';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { CalendarEventItem } from '../schedules';

@Component({
  selector: 'app-schedule-details',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './schedule-details.component.html',
  styleUrl: './schedule-details.component.scss',
})
export class ScheduleDetailsComponent {

  @ViewChild('scheduleCalendar') scheduleCalendar!: FullCalendarComponent;
  
  pageInfo: MenuItem = [ {label: 'Schedules'}, {label: 'List', routerLink: '/schedule/schedule-library'}, {label: 'Details'} ];

  scheduleServices = inject(SchedulesService);
  playlistService = inject(PlaylistService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  utils = inject(UtilityService);
  router = inject(Router);

  formBuilder = inject(FormBuilder);
  scheduleForm = this.formBuilder.group({
    id: [0],
    name: ['Morning Promo Loop', Validators.required],
    description: ['Displays promotional content every morning'],
    start: [null],
    end: [null],
    entries: [[], Validators.required],
  })

  isEditMode = signal<boolean>(false);
  isAddContent = signal<boolean>(false);
    
  calendarTitle = signal<string>('');
  calendarDateRange = signal<{ start: Date, end: Date } | null>(null);
  calendarViewSignal = signal<string>('timeGridWeek');
  calendarViews = signal<any[]>([
    { label: 'Day', value: 'timeGridDay' },
    { label: 'Week', value: 'timeGridWeek' },
    { label: 'Month', value: 'dayGridMonth' },
  ]);
  

  onDateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('start')?.value;
    const end = group.get('end')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { startAfterEnd: true }
    }
    return null;
  }

  currentDateRange = signal<string>('');
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin  ],
    height: '100%',
    nowIndicator: true,
    scrollTime: moment().subtract(1, 'hour').format('HH:mm'), // Set the scroll time to 1 hour ago
    selectable: true,
    editable: true,
    
    dayHeaderFormat: { weekday: 'short' },
    headerToolbar: false,
    fixedWeekCount: false,
    eventOrder: 'start',
    views: {
      timeGridWeek: { type: 'timeGrid', duration: { days: 7 }, buttonText: 'Week' },
      timeGridDay: { type: 'timeGrid', duration: { days: 1 }, buttonText: 'Day' },
    },
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    },
    events: [],
    datesSet: this.onDateSet.bind(this),
    eventChange: (info: any) => this.onEventUpdate(info),
    eventClick: (info: any) => this.onEventClick(info),
    eventContent: (info: any) => this.onRenderEventContent(info),
  }
  
  hasUnsavedChanges!: () => boolean;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }
  
  hasUnsavedData(): boolean {
    return this.scheduleForm.invalid && this.scheduleForm.dirty;
  }

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() { }

  ngOnDestroy() { }

  onClickSave(event: Event) {
    const calendarApi = this.scheduleCalendar.getApi();
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-question-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Schedule saved successfully!' });
      },
      reject: () => { }
    })
  }

  onClickCancel() {
    this.router.navigate([ '/schedule/schedule-library' ]);
  }

  onClickAddContent() {
    this.isAddContent.set(true);
  }

  onEventClick(data: any) {  }

  async onClickDeleteContent(event: any) { }

  onClickNextCalendar() {
    const calendar = this.scheduleCalendar.getApi();
    calendar.next();
  }

  onClickPreviousCalendar() {
    const calendar = this.scheduleCalendar.getApi();
    calendar.prev();
  }

  onChangeCalendarView(event: any) {
    const calendar = this.scheduleCalendar.getApi();
    calendar.changeView(event.value);
  }

  onEventUpdate(info: any) { }

  onDateSet(event: any) {
    const start = event.start;
    const end = event.end;
    this.calendarDateRange.set({ start, end });
    this.calendarTitle.set(event.view.title);
  }

  onClosePreview() { }

  onRenderEventContent(arg: any) {
    const event = arg.event;
    const title = event.title || '';
    const bg = event.backgroundColor ;

    return {
      html: `<div class="text-xs text-white w-full h-full px-1 rounded-sm" style="background-color: ${bg}">${title}</div>`
    };
  }
  
/**
 * Handles adding content to the schedule form.
 * It will add the given content as events to the calendar,
 * and update the start and end dates of the schedule form accordingly.
 * @param {any} event - The content to be added to the schedule form.
 */
  onAddContentChange(event: any) {    
    const calendar = this.scheduleCalendar.getApi();
    const events: CalendarEventItem[] = this.scheduleServices.onAddContent(event);
    calendar.addEventSource(events.map((event: any, id: number) => ({ ...event, id })));
    events.forEach((event: CalendarEventItem) => this.formControl('entries').value.push(event));
    
    const entries = this.formControl('entries').value;
    const startDate: any = moment.min(entries.map((item: any) => moment(item.start))).startOf('day').toISOString();
    const endDate: any = moment.max(entries.map((item: any) => moment(item.end))).endOf('day').toISOString();
    
    this.scheduleForm.patchValue({ start: startDate, end: endDate })
    console.log(this.scheduleForm.value);    
  }
  
  formControl(fieldName: string) {
    return this.utils.getFormControl(this.scheduleForm, fieldName);
  }

  /**
   * Returns an object containing the number of images, videos, audio files, and playlists associated with the schedule entries.
   * @returns {Object} - An object containing the number of images, videos, audio files, and playlists associated with the schedule entries.
   * @property {number} images - The number of images associated with the schedule entries.
   * @property {number} videos - The number of videos associated with the schedule entries.
   * @property {number} audios - The number of audio files associated with the schedule entries.
   * @property {number} playlists - The number of playlists associated with the schedule entries.
   */
  fileCount() {
    const entries = this.formControl('entries').value;
    const assets = entries.map((item: any) => item.extendedProps).filter((item: any) => item.type == 'asset');
    const playlists = entries.map((item: any) => item.extendedProps).filter((item: any) => item.type == 'playlist');

    return {
      image: assets.filter((item: any) => item.content.type == 'image').length,
      video: assets.filter((item: any) => item.content.type == 'video').length,
      audio: assets.filter((item: any) => item.content.type == 'audio').length,
      playlist: playlists.length
    }
    
  }
}
