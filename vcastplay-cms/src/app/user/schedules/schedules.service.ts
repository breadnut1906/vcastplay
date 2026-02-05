import { inject, Injectable } from '@angular/core';
import { AssetsService } from '../assets/assets.service';
import { PlaylistService } from '../playlist/playlist.service';
import { CalendarEventItem, ContentItems, Schedule } from './schedules';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage.service';
import { environment } from '../../../environments/environment.development';
import moment from 'moment';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  // designlayoutService = inject(DesignLayoutService);
  storage = inject(StorageService);
  http = inject(HttpClient);

  api: string = environment.api
  
  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  } 
  
  onPageChange(event: any) { }

  onLoadSchedules(page: number = 1, limit: number = 10) {
    /**Call GET API */
    return this.http.get(`${this.api}/tenants/schedules`, { headers: this.onGetHTTPHeaders() });
  }

  onGetScheduleById() {
    /**Call GET API */
  }

  onSaveSchedule(schedule: Schedule) { }

  onDeleteSchedule(schedule: Schedule) {
    /**Call DELETE API */
  }

  onDuplicateSchedule(schedule: Schedule) {
    /**CALL POST API */
  }

  onApproveSchedule(schedule: Schedule, status: string) {
    /**CALL PATCH API */
  }

 
  /**
   * Returns an array of calendar events based on the given content items.
   * This function generates events for each day of the given week days,
   * and for each hour of the given hours.
   * If isAllDay is true, it generates an event for the whole day.
   * If isAllWeekdays is true, it generates events for all week days.
   * @param {ContentItems} event - The content items to generate events from.
   * @returns {CalendarEventItem[]} - An array of calendar events.
   */
  onAddContent(event: ContentItems): CalendarEventItem[] {
    let index: number = 0;
    let calendarEvents: CalendarEventItem[] = [];
    const { weekdays, hours, start, end, color, content, isAllWeekdays, isAllDay, type } = event;
    
    const startDate = moment(start).toDate();
    const endDate = moment(end).toDate();

    const curDate = new Date(startDate);
    // debugger
    while(curDate <= endDate) {
      const curWeekday = moment(curDate).format('dddd')
      if (weekdays.includes(curWeekday)) {
        const nextDay = moment(curDate).add(1, 'day').toDate();
        for (const hour of hours) {

          if (moment(hour).isSameOrAfter(nextDay)) break;

          const { start: startTime, end: endTime }: any = hour;
          const start = moment(curDate).tz('Asia/Manila').format('YYYY-MM-DD') + 'T' + moment(startTime).tz('Asia/Manila').format('HH:mm:ss');
          const end = moment(curDate).tz('Asia/Manila').format('YYYY-MM-DD') + 'T' + moment(endTime).tz('Asia/Manila').format('HH:mm:ss');
          
          // Insert event to calendar
          calendarEvents.push({ 
            id: index, 
            title: content.name, 
            start, 
            end, 
            backgroundColor: color, 
            borderColor: color, 
            extendedProps: { type, content }, 
            allDay: isAllDay || false,
            editable: false
          })
          index++;
        }
      }
      
      if (isAllDay) {
        const start = moment(curDate).startOf('day').toISOString();
        const end = moment(curDate).endOf('day').toISOString();
        
        // Insert event to calendar
        calendarEvents.push({
          id: index,
          title: content.name,
          start,
          end,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { type, content }, 
          allDay: isAllDay || false,
          editable: false
        })
      }

      curDate.setDate(curDate.getDate() + 1);
      index++;
    }
    return calendarEvents
  }

}
