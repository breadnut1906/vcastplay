import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../../core/services/utility.service';
import { BroadcastService } from '../broadcast.service';
import { TagService } from '../../tags/tag.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-broadcast-details',
  imports: [ PrimengUiModule],
  templateUrl: './broadcast-details.component.html',
  styleUrl: './broadcast-details.component.scss'
})
export class BroadcastDetailsComponent {

  @Input() showDetails = signal<boolean>(false);
  @Output() onBroadCastMessageChange = new EventEmitter<any>();

  broadcastService = inject(BroadcastService);
  tagService = inject(TagService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

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
        const { id, ...data } = this.broadCastMessageForm.value;        
        const icon = this.broadcastCategories.find(c => c.category === data.category)?.icon;
        this.broadcastService.onSaveMessage(id, { ...data, icon }, this.isEditMode()).subscribe({
          next: (res: any) => {
            this.message.add({ severity:'success', summary: 'Success', detail: 'Broadcast message saved successfully!' });
          },
          error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
          complete: () => {
            this.isEditMode.set(false);
            this.showDetails.set(false);
            this.broadCastMessageForm.reset();
            this.onBroadCastMessageChange.emit(true);
          }
        });
      },
    })
  }

  onClickCancel() {
    this.showDetails.set(false);
    this.broadCastMessageForm.reset();
  }

  get isEditMode() { return this.broadcastService.isEditMode; }
  get categories() { return this.broadcastService.broadcastCategories; }
  get broadCastMessageForm() { return this.broadcastService.broadCastMessageForm; }
  get broadcastCategories() { return this.broadcastService.broadcastCategories; }
}
