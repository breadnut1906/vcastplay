import { Component, computed, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
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
import { SchedulesContentListComponent } from '../schedules-content-list/schedules-content-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-details',
  imports: [PrimengUiModule, ComponentsModule ],
  templateUrl: './schedule-details.component.html',
  styleUrl: './schedule-details.component.scss',
})
export class ScheduleDetailsComponent {

  @ViewChild('viewport') viewportElement!: ElementRef<HTMLDivElement>;
  @ViewChild('scheduleCalendar') scheduleCalendar!: FullCalendarComponent;
  @ViewChild('scheduleContents') scheduleContents!: SchedulesContentListComponent;
  
  pageInfo: MenuItem = [ {label: 'Schedules'}, {label: 'List', routerLink: '/schedule/schedule-library'}, {label: 'Details'} ];

  scheduleServices = inject(SchedulesService);
  playlistService = inject(PlaylistService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  utils = inject(UtilityService);
  router = inject(Router);

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

  timeSlots = computed(() => this.generateTimeCode().map((timeSlot: any) => ({ ...timeSlot, value: `${timeSlot.start} - ${timeSlot.end}`})) );

  totalByType = signal<any>({});
  
  hasUnsavedChanges!: () => boolean;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }

  constructor() {
    // effect(() => {
    //   // change calendar view when mobile
    //   if (!this.isDesktop()) {
    //     this.calendarViewSignal.set('timeGridDay');
    //     this.onChangeCalendarView({ value: 'timeGridDay' });
    //   }
    // })
  }

  ngOnInit() {
    if (!this.isEditMode()) {
      this.scheduleForm.reset();
      this.contentItemForm.reset();
    }    
  }

  ngAfterViewInit() {    
    if (this.isEditMode()) this.onAddCalendarEvents();
  }

  ngOnDestroy() {
    this.scheduleForm.reset();
    this.calendarViewSignal.set('timeGridWeek');
  }
  
  hasUnsavedData(): boolean {
    return this.scheduleForm.invalid;
  }

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
        console.log(this.scheduleForm.value);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Schedule saved successfully!' });
        this.scheduleServices.onSaveSchedule(this.scheduleForm.value);
        this.router.navigate([ '/schedule/schedule-library' ]);        
      },
      reject: () => { }
    })
  }

  onClickCancel() {
    this.router.navigate([ '/schedule/schedule-library' ]);
  }

  onClickAddContent() {
    this.contentItemForm.reset();
    const isMonth = ['dayGridMonth'].includes(this.calendarViewSignal());
    const time = this.timeSlots().find(slot => slot.value == this.timeSlotSignal());
    const start = moment(this.calendarDateRange()?.start).format('YYYY-MM-DD');
    const end = moment(this.calendarDateRange()?.end).subtract(1, 'day').format('YYYY-MM-DD');    
    
    const startDateTime = moment(`${start} ${time.start}`, 'YYYY-MM-DD HH:mm:ss').toDate();
    const endDateTime = moment(`${end} ${time.end}`, 'YYYY-MM-DD HH:mm:ss').toDate();
    
    this.onSelectContents({ start: startDateTime, end: endDateTime, allDay: isMonth }, false);
    this.scheduleContents.contents.selectionContent.set(null);
    this.showAddContents.set(true);
  }

  onEventClick(data: any) { 
    const { id, title, start, end, backgroundColor, borderColor, extendedProps, allDay } = data.event;
    this.selectedContent.set({ id, title, start, end, backgroundColor, borderColor, extendedProps, allDay });    
    this.showPreviewEvent.set(true);
  }

  async onClickDeleteContent(event: any) {
    this.scheduleServices.onDeleteContent(this.selectedContent(), this.scheduleCalendar);
    const { contents } = this.scheduleForm.value;
    this.onUpdateTotalContentsByType(contents);
    this.showPreviewEvent.set(false);
  }

  onClickNextCalendar() {
    const calendar = this.scheduleCalendar.getApi();
    calendar.next();
  }

  onClickPreviousCalendar() {
    const calendar = this.scheduleCalendar.getApi();
    calendar.prev();
  }

  onSelectContents({ start, end, allDay }: { start: any, end: any, allDay: boolean }, isSpecificTime: boolean = true) {    
    const startDate = moment(start);
    const endDate = allDay ? moment(end).subtract(1, 'day') : moment(end);
    this.currentDateRange.set(`${startDate.format('MMM DD, yyyy')} - ${endDate.format('MMM DD, yyyy')}`);

    this.contentItemForm.patchValue({ start: startDate.toDate(), end: !isSpecificTime ? endDate.toDate() : null, allDay });
    this.calendarSelectedDate.set({ start, end, allDay, isSpecificTime });
    this.showAddContents.set(true);
  }

  async onAddCalendarEvents() {    
    const calendar = this.scheduleCalendar.getApi();
    const { contents } = this.scheduleForm.value;    
    const events: any[] = contents.filter((event: any) => !event.isFiller).map((content: any) => ({
      id: content.id,
      title: content.title,
      start: moment(content.start).toISOString(),
      end: moment(content.end).toISOString(),
      backgroundColor: content.backgroundColor,
      borderColor: content.borderColor,
      extendedProps: content.extendedProps,
      allDay: content.allDay,
    }));
    calendar.addEventSource(events);
    this.onUpdateTotalContentsByType(contents);
  }

  onChangeCalendarView(event: any) {
    const calendar = this.scheduleCalendar.getApi();
    calendar.changeView(event.value);
  }

  onEventUpdate(info: any) {
    this.scheduleServices.onUpdateContent(info.event);
  }

  onDateSet(event: any) {
    const start = event.start;
    const end = event.end;
    this.calendarDateRange.set({ start, end });
    this.calendarTitle.set(event.view.title);
  }

  onClosePreview() {
    const { extendedProps } = this.selectedContent();
    if (extendedProps.type == 'playlist') {
      this.playlistForm.reset();
    }
    this.selectedContent.set(null);
  }

  onRenderEventContent(arg: any) {
    const event = arg.event;
    const title = event.title || '';
    const bg = event.backgroundColor ;

    return {
      html: `<div class="text-xs text-white w-full h-full px-1 rounded-sm" style="background-color: ${bg}">${title}</div>`
    };
  }

  async onUpdateTotalContentsByType(contents: any) {
    const [ totalContentByType ]: any = await Promise.all([ this.scheduleServices.onGetTotalContentsByType(contents) ]);
    this.totalByType.set(totalContentByType); 
  }

  onGetTotalContentsByType(event: any) {
    this.totalByType.set(event); 
  }
  
  formControl(fieldName: string) {
    return this.utils.getFormControl(this.scheduleForm, fieldName);
  }
  
  get totalFillers() {
    const { contents } = this.scheduleForm.value;
    return contents.filter((event: any) => event.isFiller).length.toString();
  }

  get isDesktop() { return this.utils.isDesktop; }
  get generateTimeCode() { return this.utils.generateTimeCode; }
  get isEditMode() { return this.scheduleServices.isEditMode; }
  get scheduleForm() { return this.scheduleServices.scheduleForm; }
  get contentItemForm() { return this.scheduleServices.contentItemForm; }
  get selectedContent() { return this.scheduleServices.selectedContent; }
  get showAddContents() { return this.scheduleServices.showAddContents; }
  get showFillerContents() { return this.scheduleServices.showFillerContents; }
  get showPreviewEvent() { return this.scheduleServices.showPreviewEvent; }
  get calendarTitle() { return this.scheduleServices.calendarTitle; }
  get calendarViewSignal() { return this.scheduleServices.calendarViewSignal; }
  get calendarViews() { return this.scheduleServices.calendarViews; }
  get timeSlotSignal() { return this.scheduleServices.timeSlotSignal; }
  get calendarDateRange() { return this.scheduleServices.calendarDateRange; }
  get calendarSelectedDate() { return this.scheduleServices.calendarSelectedDate; }
  get playlistForm() { return this.playlistService.playListForm; }
  get status() { return this.scheduleForm.get('status'); }

}
