import { Component, computed, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../../screens/screen.service';
import { ComponentsModule } from '../../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UtilityService } from '../../../../core/services/utility.service';
import { BroadcastService } from '../broadcast.service';
import { ScreenMessage } from '../../../screens/screen';
import { Pagination } from '../../../../shared/interfaces/general';

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

  broadcast = signal<ScreenMessage[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.onInitializedBroadcast();
  }

  onInitializedBroadcast(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.broadcastService.onLoadMessages().subscribe({
      next: (res: any) => {
        this.broadcast.set(res.items);
        this.pagination.set(res.meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    });
  }

  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializedBroadcast(pageNumber, event.rows);
  }

  onBroadCastMessageChange(event: any) {
    if (event) this.onInitializedBroadcast();
  }

  onClickAddNew() {
    this.isEditMode.set(false);
    this.showDetails.set(true);
  }

  onClickRefresh() {}

  onClickEdit(message: ScreenMessage) {
    this.isEditMode.set(true);
    this.showDetails.set(true);
    this.broadCastMessageForm.patchValue(message);
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
        this.broadcastService.onDeleteMessage(message).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Broadcast message deleted successfully!' }),
          error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
          complete: () => this.onInitializedBroadcast()
        })
      },
      reject: () => { }
    })
  }

  onClickCancel() {
    this.showDetails.set(false);
    this.broadCastMessageForm.reset();
  }
  
  categories(screenMessage: ScreenMessage): any {
    const category = this.broadcastService.broadcastCategories;
    const cat = category.find(cat => cat.category.toLowerCase() == screenMessage.category.toLowerCase());
    return cat
  }

  get rows() { return this.broadcastService.rows; }
  get isEditMode() { return this.broadcastService.isEditMode; }
  get totalRecords() { return this.broadcastService.totalRecords; }
  get messages() { return this.broadcastService.messages; }
  get showDetails() { return this.broadcastService.showDetails; }
  get loadingSignal() { return this.broadcastService.loadingSignal; }
  get broadCastMessageForm() { return this.broadcastService.broadCastMessageForm; }
}
