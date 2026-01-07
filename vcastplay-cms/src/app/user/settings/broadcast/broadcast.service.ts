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
    this.messageSignal.set([
      {
        id: 1,
        icon: 'pi-megaphone',
        name: 'System Alert',
        category: 'Alert',
        title: 'System Maintenance',
        description: 'Scheduled system maintenance will occur tonight.',
        message: 'Please save your work. System maintenance begins at 10:00 PM.',
        duration: 30,
        isDisplayed: true,
        displayedOn: new Date('2025-07-17T08:00:00'),
        createdOn: new Date('2025-07-16T10:00:00'),
        updatedOn: new Date('2025-07-16T10:30:00')
      },
      {
        id: 2,
        icon: 'pi-megaphone',
        name: 'New Feature',
        category: 'Update',
        title: 'New Dashboard Released',
        description: 'We’ve launched a new analytics dashboard.',
        message: 'Check out the new dashboard under the “Analytics” tab.',
        duration: 45,
        isDisplayed: false,
        displayedOn: new Date('2025-07-18T09:00:00'),
        createdOn: new Date('2025-07-16T11:00:00'),
        updatedOn: new Date('2025-07-16T11:15:00')
      },
    ])
    this.totalRecords.set(this.messageSignal().length);
  }

  onGetMessages() {
    if (this.messageSignal().length === 0) this.onLoadMessages();
    return this.messageSignal();
  }

  onSaveMessage(message: ScreenMessage) {
    const tempAssets = this.messages();
    const { id, ...info } = message;    
    const index = tempAssets.findIndex(u => u.id === id);
    if (index !== -1) tempAssets[index] = { ...tempAssets[index], ...info };
    else tempAssets.push({ id: tempAssets.length + 1, ...info, createdOn: new Date(), updatedOn: new Date() });

    this.messageSignal.set([...tempAssets]);
    this.totalRecords.set(this.messages().length);
    /**Call POST/PATCH user API */
  }

  onDeleteMessage(message: ScreenMessage) {
    const tempAssets = this.messages().filter(m => m.id !== message.id);
    this.messageSignal.set([...tempAssets]);
    this.totalRecords.set(this.messages().length);
    /**Call DELETE user API */
  }
}
