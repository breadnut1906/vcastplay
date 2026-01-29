import { computed, inject, Injectable, signal } from '@angular/core';
import { ScreenMessage } from '../../screens/screen';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../../core/services/storage.service';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  storage = inject(StorageService);
  http = inject(HttpClient);
  
  api: string = environment.api;

  private messageSignal = signal<ScreenMessage[]>([]);
  messages = computed(() => this.messageSignal());
  
  first = signal<number>(0);
  rows = signal<number>(8);
  totalRecords = signal<number>(0);

  isEditMode = signal<boolean>(false);
  loadingSignal = signal<boolean>(false);
  showDetails = signal<boolean>(false);

  selectedArrScreenBroadcastMessage = signal<ScreenMessage[]>([]);
  selectedScreenBroadcastMessage = signal<ScreenMessage | null>(null);
  
  broadcastCategories = [
    { icon: 'pi-cog', category: 'System Alert', color: '#FF6384' },
    { icon: 'pi-wrench', category: 'Maintenance', color: '#FF9F40' },
    { icon: 'pi-power-off', category: 'Downtime', color: '#000000' },
    { icon: 'pi-exclamation-triangle', category: 'Service Degradation', color: '#FFCD56' },
    { icon: 'pi-upload', category: 'Update / Patch', color: '#36A2EB' },
    { icon: 'pi-refresh', category: 'Restart Required', color: '#9966FF' },
    { icon: 'pi-server', category: 'Server Update', color: '#3F51B5' },
    { icon: 'pi-shield', category: 'Operational Advisory', color: '#483D3C' },
    { icon: 'pi-megaphone', category: 'General Announcement', color: '#4BC0C0' },
    { icon: 'pi-building', category: 'Company News', color: '#FA8072' },
    { icon: 'pi-file-edit', category: 'Policy Update', color: '#808080' },
    { icon: 'pi-star', category: 'Features', color: '#DA70D6' },
    { icon: 'pi-book', category: 'Release Notes', color: '#CCCCFF' },
    { icon: 'pi-clock', category: 'Scheduled Notice', color: '#FFC0CB' },
    { icon: 'pi-info-circle', category: 'Public Notice', color: '#ffffff' }
  ];

  broadCastMessageForm: FormGroup = new FormGroup({
    id: new FormControl(0, { nonNullable: true }),
    icon: new FormControl(null),
    name: new FormControl(null),
    category: new FormControl(null),
    title: new FormControl(null),
    description: new FormControl(null),
    message: new FormControl(null),
    duration: new FormControl(5, { nonNullable: true }),
  });
  
  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }

  constructor() { }

  onLoadMessages(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.api}tenants/broadcast?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }

  onSaveMessage(id: number, message: ScreenMessage, mode: boolean = false) {
    /**Call POST/PATCH user API */
    if (!mode) {
      return this.http.post(`${this.api}tenants/broadcast`, message, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/broadcast/${id}`, message, { headers: this.onGetHTTPHeaders() });
    }
  }

  onDeleteMessage(message: ScreenMessage) {
    /**Call DELETE user API */
    return this.http.delete(`${this.api}tenants/broadcast/${message.id}`, { headers: this.onGetHTTPHeaders() });
  }
}
