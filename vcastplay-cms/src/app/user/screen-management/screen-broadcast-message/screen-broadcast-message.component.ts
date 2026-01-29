import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { ScreenMessage } from '../../screens/screen';
import { Pagination } from '../../../shared/interfaces/general';
import { MessageService } from 'primeng/api';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-screen-broadcast-message',
  imports: [ PrimengUiModule, PaginatorComponent ],
  templateUrl: './screen-broadcast-message.component.html',
  styleUrl: './screen-broadcast-message.component.scss'
})
export class ScreenBroadcastMessageComponent {

  @Input() showBroadcast = signal<boolean>(false);
  @Output() onBroadCastMessage = new EventEmitter<any>();

  broadcastService = inject(BroadcastService);
  message = inject(MessageService);
  utils = inject(UtilityService);

  isLoading = signal<boolean>(false);
  messages = signal<ScreenMessage[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  selectedScreenBroadcastMessage = signal<ScreenMessage | null>(null);

  ngOnInit() { }

  onLoadMessages(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.broadcastService.onLoadMessages(page, limit).subscribe({
      next: (res: any) => {
        this.messages.set(res.items);
        this.pagination.set(res.meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    })
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onLoadMessages(pageNumber, event.rows);
  }

  onClickSendBroadcast() { 
    this.onBroadCastMessage.emit(this.selectedScreenBroadcastMessage()); 
  }

  onClickCloseDialog() { 
    this.showBroadcast.set(false);
  }
}
