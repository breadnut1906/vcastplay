import { computed, Injectable, signal } from '@angular/core';
import { ScreenMessage } from '../../screens/screen';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

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

  constructor() { }

  onLoadMessages() {
    this.messageSignal.set([])
    this.totalRecords.set(this.messageSignal().length);
  }

  onGetMessages() {
    if (this.messageSignal().length === 0) this.onLoadMessages();
    return this.messageSignal();
  }

  onSaveMessage(message: ScreenMessage) {
    /**Call POST/PATCH user API */
  }

  onDeleteMessage(message: ScreenMessage) {
    /**Call DELETE user API */
  }
}
