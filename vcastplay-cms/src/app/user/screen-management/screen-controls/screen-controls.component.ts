import { Component, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { StorageService } from '../../../core/services/storage.service';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { Screen, ScreenItems } from '../../screens/screen';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';
import { ScreenSettingsComponent } from '../../../shared/components/screen-settings/screen-settings.component';
import { ScreenBroadcastMessageComponent } from '../screen-broadcast-message/screen-broadcast-message.component';

@Component({
  selector: 'app-screen-controls',
  imports: [ PrimengUiModule, ContentSelectionComponent, ScreenSettingsComponent, ScreenBroadcastMessageComponent ],
  templateUrl: './screen-controls.component.html',
  styleUrl: './screen-controls.component.scss'
})
export class ScreenControlsComponent {

  @ViewChild('contents') contents!: ContentSelectionComponent;

  @Input() selectMultipleScreens = signal<Screen[]>([]);

  @Output() onScreenControlChange = new EventEmitter<any>();

  screenService = inject(ScreenService);
  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);
  storage = inject(StorageService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  publicApi: string = environment.public;

  isSending = signal<boolean>(false);
  showContents = signal<boolean>(false);
  showSettings = signal<boolean>(false);
  showBroadcast = signal<boolean>(false);

  formBuilder = inject(FormBuilder);
  selectedContentForm = this.formBuilder.group({
    id: [''],
    name: ['', [ Validators.required ]],
    type: ['']
  })

  // Assets | Playlist | Schedule | Design Layout
  selectedContent = signal<any>(null);

  screenItems = signal<ScreenItems[]>([]);

  onClickOpenContents() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    // this.contents.selectionContent.set([]);
    this.showContents.set(true);
  }

  onClickApplyContents() {
    this.isSending.set(true);
    const screens = this.selectMultipleScreens();
    const newScreens: any = Array.from(screens).map((screen: any) => ({ id: screen.id, content: this.selectedContent(), progress: 0, status: 'pending' }));
    this.screenItems.set(newScreens);

    this.screenItems().forEach((item: ScreenItems) => {
      item.status = 'sending';
      item.sub = this.screenService.onApplyContents(item.id, item.content).subscribe({
        next: (event: any) => {
          if (event.type == HttpEventType.UploadProgress && event.total) {
            item.progress = Math.round((event.loaded / event.total) * 100);
          }

          if (event.type == HttpEventType.Response) {
            item.status = 'success';
            item.progress = 100;
          }
        },
        error: (error: any) => {
          item.status = 'error';
          item.progress = 0;
          item.error = error;
          console.error(`Upload failed: ${item.content.name}`, error);
          this.onCheckAllDone()
        },
        complete: () => this.onCheckAllDone()
      })
    })
    this.onScreenControlChange.emit({ type: 'apply', data: this.screenItems() });
    this.selectedContent.set(null);
    this.selectedContentForm.reset();
  }

  onClickSendCommand(command: string) {

    // Checks if any screen is selected
    if (this.hasSelected) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    
    this.isSending.set(true);
    const screens = this.selectMultipleScreens().filter((screen: any) => ['connected'].includes(screen.status));
    const newScreens: any = Array.from(screens).map((screen: any) => ({ id: screen.id, content: this.selectedContent(), progress: 0, status: 'pending' }));
    this.screenItems.set(newScreens);

    this.screenItems().forEach((item: ScreenItems) => {
      item.status = 'sending';
      item.sub = this.screenService.onSendCommand(item.id, item.content, command).subscribe({
        next: (event: any) => {
          if (event.type == HttpEventType.UploadProgress && event.total) {
            item.progress = Math.round((event.loaded / event.total) * 100);
          }

          if (event.type == HttpEventType.Response) {
            item.status = 'success';
            item.progress = 100;
          }
        },
        error: (error: any) => {
          item.status = 'error';
          item.progress = 0;
          item.error = error;
          console.error(`Upload failed: ${item.content.name}`, error);
          this.onCheckAllDone()
        },
        complete: () => this.onCheckAllDone()
      })
    })
    this.selectedContent.set(null);
    this.selectedContentForm.reset();
  }

  onClickBroadCastMessage() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }

    this.showBroadcast.set(true);
  }

  onClickOpenSettings() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }

    this.showSettings.set(true);
  }
  
  onSelectionChange(event: any) {
    if (!event) {
      this.selectedContentForm.reset();
      this.selectedContent.set(null);
      return;
    }
    this.selectedContentForm.patchValue({ id: event.id, name: event.name, type: event.type });
    this.selectedContent.set({ 
      type: this.contentType(), 
      content: { 
        id: event.id, 
        name: event.name, 
        type: event.type, 
        url: ['facebook', 'youtube', 'link'].includes(event.type) ? event.link 
          : `${this.publicApi}assets/${this.tenantId}/${event.name}`,
        status: event.status,
        updatedAt: event.updatedAt
      } 
    });
  }

  onContentTypeChange(event: any) {
    this.contentType.set(event);
  }

  onCheckAllDone() {
    const finished = this.screenItems().every(i => i.status === 'success' || i.status === 'error' || i.status === 'cancel');
    if (finished) this.isSending.set(false);
  }

  onSettingsChange(event: any) {
    console.log(this.settingsForm.value);
    
    this.message.add({ severity:'success', summary: 'Success', detail: 'Settings applied successfully!' });
    this.showSettings.set(false);
  }

  onClearAllChange() {
    this.onClickSendCommand('clear');
    // this.showSettings.set(false);
  }
  
  onBroadCastMessage(event: any) {
    if (!event) return;
    this.selectedContent.set({
      icon: event.icon,
      name: event.name,
      category: event.category,
      title: event.title,
      description: event.description,
      message: event.message,
      duration: event.duration
    });
    this.onClickSendCommand('broadcast');
  //   const messageArr: ScreenMessage[] = this.selectedArrScreenBroadcastMessage();
  //   if (messageArr.length == 0) return;
  //   this.screenService.onBroadCastMessage(messageArr);
  //   this.message.add({ severity:'success', summary: 'Success', detail: 'Broadcast message sent successfully!' });
  //   this.showBroadcast.set(false);
  //   this.selectedArrScreenBroadcastMessage.set([]);
  }

  get isMobile() { return this.utils.isMobile(); }
  get isTablet() { return this.utils.isTablet(); }
  get contentType() { return this.screenService.contentType; }

  get tenantId() { return this.storage.get('id'); }
  get hasSelected() { return this.selectMultipleScreens().length == 0; }
  get settingsForm() { return this.screenService.settingsForm; }
}
