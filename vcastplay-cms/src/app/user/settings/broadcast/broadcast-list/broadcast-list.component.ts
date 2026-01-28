import { Component, computed, inject } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../../screens/screen.service';
import { ComponentsModule } from '../../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UtilityService } from '../../../../core/services/utility.service';
import { BroadcastService } from '../broadcast.service';
import { ScreenMessage } from '../../../screens/screen';

@Component({
  selector: 'app-broadcast-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './broadcast-list.component.html',
  styleUrl: './broadcast-list.component.scss',
})
export class BroadcastListComponent {

  pageInfo: MenuItem = [ { label: 'Messages' }, { label: 'Lists' } ];

  screenService = inject(ScreenService);
  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  filteredMessages = computed(() => this.broadcastService.messages());

  ngOnInit() { }

  onClickAddNew() {
    this.isEditMode.set(false);
    this.showDetails.set(true);
  }

  onClickRefresh() {}

  onClickEdit(message: ScreenMessage) { }

  onClickSave(event: Event) {
    if (this.broadCastMessageForm.invalid) {
      this.broadCastMessageForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        this.broadcastService.onSaveMessage(this.broadCastMessageForm.value);
        this.message.add({ severity:'success', summary: 'Success', detail: 'Broadcast message saved successfully!' });
        this.showDetails.set(false);
        this.broadCastMessageForm.reset();
      },
    })
  }

  onClickDelete(message: ScreenMessage, event: any) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this message?',
      closable: true,
      closeOnEscape: true,
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.broadcastService.onDeleteMessage(message);
        this.message.add({ severity:'success', summary: 'Success', detail: 'Broadcast message deleted successfully!' });
      },
      reject: () => { }
    })
  }

  onClickCancel() {
    this.showDetails.set(false);
    this.broadCastMessageForm.reset();
  }

  get rows() { return this.broadcastService.rows; }
  get isEditMode() { return this.broadcastService.isEditMode; }
  get totalRecords() { return this.broadcastService.totalRecords; }
  get messages() { return this.broadcastService.messages; }
  get showDetails() { return this.broadcastService.showDetails; }
  get loadingSignal() { return this.broadcastService.loadingSignal; }
  get broadCastMessageForm() { return this.broadcastService.broadCastMessageForm; }
}
